"""Deployment-order regression checks with stub commands; never touches real Docker/data."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "deploy-mimo.sh"

class DeploymentOrderTests(unittest.TestCase):
    def run_deploy(self, mode):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        root = Path(temp.name)
        (root / "scripts").mkdir()
        (root / "infra/docker").mkdir(parents=True)
        shutil.copy2(SCRIPT, root / "scripts/deploy-mimo.sh")
        (root / ".env").write_text("TEST_ONLY=yes\n")
        (root / "infra/docker/docker-compose.yml").write_text("services: {}\n")
        (root / "infra/docker/docker-compose.assistant.yml").write_text("services: {}\n")
        bins = root / "bin"
        bins.mkdir()
        stubs = {
            "docker": '''#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$MIMO_TEST_LOG"
case "$1" in
  inspect)
    if [[ "$*" == *State.Health* ]]; then
      if [[ "$MIMO_TEST_MODE" == bad-health ]]; then echo unhealthy; else echo healthy; fi
    else echo sha256:old-image; fi ;;
  compose)
    if [[ "$*" == *' exec -T postgres '* ]]; then
      if [[ "$MIMO_TEST_MODE" != empty-backup ]]; then echo fixture-database-backup; fi
    elif [[ "$*" == *' build api web'* && "$MIMO_TEST_MODE" == build-fails ]]; then exit 9
    fi ;;
esac
''',
            "git": "#!/usr/bin/env bash\nif [[ \"$1\" == rev-parse ]]; then echo test-commit; fi\n",
            "curl": "#!/usr/bin/env bash\nexit 0\n",
            "sleep": "#!/usr/bin/env bash\nexit 0\n",
        }
        for name, body in stubs.items():
            target = bins / name
            target.write_text(body)
            target.chmod(0o755)
        env = dict(os.environ, PATH=str(bins) + os.pathsep + os.environ["PATH"],
                   MIMO_BACKUP_ROOT=str(root / "backups"), MIMO_TEST_MODE=mode,
                   MIMO_TEST_LOG=str(root / "calls.log"))
        result = subprocess.run(["bash", str(root / "scripts/deploy-mimo.sh")], env=env,
                                capture_output=True, text=True, timeout=15)
        return root, result, (root / "calls.log").read_text()

    def test_success_backs_up_before_build_and_only_replaces_app_services(self):
        root, result, calls = self.run_deploy("success")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertLess(calls.index("exec -T postgres"), calls.index(" build api web"))
        self.assertLess(calls.index(" build api web"), calls.index(" up -d --no-deps --no-build api web"))
        backup = next((root / "backups").iterdir())
        self.assertTrue((backup / "database.dump").stat().st_size)
        self.assertEqual((backup / "server.env").stat().st_mode & 0o777, 0o600)
        self.assertTrue((backup / "rollback.yml").exists())
        self.assertNotIn(" down", calls)
        self.assertNotIn("db:seed", calls)
        self.assertNotIn("migrate", calls)

    def test_build_failure_never_replaces_running_containers(self):
        _, result, calls = self.run_deploy("build-fails")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn(" up ", calls)

    def test_empty_database_backup_stops_before_build(self):
        _, result, calls = self.run_deploy("empty-backup")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn(" build api web", calls)
        self.assertNotIn(" up ", calls)

    def test_failed_health_check_prints_previous_image_rollback(self):
        _, result, _ = self.run_deploy("bad-health")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("rollback.yml", result.stderr)
        self.assertIn("--no-deps --no-build api web", result.stderr)

if __name__ == "__main__":
    unittest.main()
