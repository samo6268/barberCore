-- Enable Row Level Security helper function
-- Called once on DB initialization

-- Create a function to set the current tenant context
CREATE OR REPLACE FUNCTION set_tenant_id(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get the current tenant context
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to the barbercore user
GRANT EXECUTE ON FUNCTION set_tenant_id(UUID) TO barbercore;
GRANT EXECUTE ON FUNCTION current_tenant_id() TO barbercore;
