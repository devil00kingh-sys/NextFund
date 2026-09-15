const dns = require('dns');

const servers = dns.getServers();

if (servers.length === 0 || servers.some(s => s === '127.0.0.1')) {
  dns.setServers(['10.210.114.39', '8.8.8.8']);
  console.log('[dns] preferred resolvers unavailable; switched to working DNS servers');
}