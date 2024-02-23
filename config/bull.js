module.exports.bull = {
    redis: {
        host: 'localhost',
        port: 6379,
        db: 0,
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    },
    //generate cron format using: https://crontab.guru
    repeats: [
        {
            name: 'marketing_update_connectors', // update marketing_connectors table with data from config/integrations.js
            active: true,
            repeat: { cron: "1 0 * * *" },
            data: {}
        },
        {
            name: 'marketing_update_jobs', // update marketing_jobs table with data from config/jobs.js
            active: true,
            repeat: { cron: "5 0 * * *" },
            data: {}
        },
        // {
        //     name: 'start_queued_jobs', // This picks up jobs that are queued and attempts to get rundeck to accept the job
        //     active: true,
        //     repeat: { every: 10000*1000 }, // run every 10 secs
        //     data: {}
        // },
    ]
}