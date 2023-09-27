export default () => ({
    api: {
        version: process.env.SENSOR_API_VERSION || 1,
        xapi: process.env.XAPI,
        url: process.env.SENSOR_API_URL || 'http://localhost:8080',
    }
});
