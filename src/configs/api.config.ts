export default () => ({
    env: process.env.NODE_ENV || 'local',
    port: parseInt(process.env.PORT, 10) || 8181,
  });
  