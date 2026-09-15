import { httpServerHandler } from 'cloudflare:node';
import app from '../app.js';

app.listen(3000);
const expressHandler = httpServerHandler({ port: 3000 });

const CLEAN_ROUTES = {
  '/admin': '/admin.html',
  '/yc': '/yc/yc-application.html',
  '/about': '/about.html',
  '/startups': '/startups.html',
  '/investor-brief': '/investor-brief.html',
  '/partners': '/partners.html',
  '/events': '/events.html',
  '/blog-insights': '/blog-insights.html',
  '/gallery': '/gallery.html',
  '/contact-us': '/contact-us.html',
  '/school': '/school.html',
  '/terms-privacy': '/terms-privacy.html',
};

export default {
  async fetch(request, env, ctx) {
    if (env) {
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string') {
          process.env[key] = value;
        }
      }
    }

    const url = new URL(request.url);

    // API -> Express app (handles /api/*)
    if (url.pathname.startsWith('/api/')) {
      app.locals.cfEnv = env;
      return expressHandler(request, env, ctx);
    }

    // Static page aliases (clean URLs and legacy paths)
    const normalizedPath = url.pathname.replace(/\/$/, '');
    const aliasPath = CLEAN_ROUTES[normalizedPath];

    if (aliasPath) {
      const newUrl = new URL(url);
      newUrl.pathname = aliasPath;
      const newReq = new Request(newUrl.toString(), request);
      return env.ASSETS.fetch(newReq);
    }

    // Everything else -> static assets
    return env.ASSETS.fetch(request);
  }
};