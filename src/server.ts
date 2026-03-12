import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(` Mentora API server running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
});
