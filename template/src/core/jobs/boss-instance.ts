import { appEnv } from '@/appEnv'
import PgBoss from 'pg-boss'


// 'postgres://seidor:seidor@localhost:5432/sf_integration_test',

export const boss = new PgBoss({
  connectionString: `postgres://${appEnv.PG_BOSS_USER}:${appEnv.PG_BOSS_PASSWORD}@${appEnv.PG_BOSS_HOST}:${appEnv.PG_BOSS_PORT}/${appEnv.PG_BOSS_DB}`,
  application_name: 'my-app-job-worker',
  retryLimit: 0,
  retryDelay: 5000,
  retryBackoff: true,
})
