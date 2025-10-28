module.exports = {
  apps: [{
    name: 'event-scraper',
    script: './src/index.js',
    args: '--schedule',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true
  }]
};
