import PgBoss from 'pg-boss'

export const boss = new PgBoss({
  connectionString: 'postgres://seidor:seidor@localhost:5432/sf_integration_test',
  application_name: 'my-app-job-worker',
  retryLimit: 0,
  retryDelay: 5000,
  retryBackoff: true,
})
