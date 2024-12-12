module.exports = {
    apps : [{
      name: "app1",
      script: "./src/app.ts",
      watch: true,
      max_memory_restart: '950M',
      exec_mode: "cluster",
      instances: "max",
      cron_restart: "59 23 * * *",

      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
    ]
  }