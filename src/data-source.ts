import "reflect-metadata"
import { DataSource } from "typeorm"
import { Teacher } from "./entity/Teacher"

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "easyedu_db",
  synchronize: true,
  logging: false,
  entities: [Teacher],
  migrations: ['src/migration/**/*.js'],
  subscribers: [],
})

