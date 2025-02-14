import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {ShamsiDateTransformer} from "../transformer/shamsi-date.transformer";

export class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({type: "timestamp" , transformer: new ShamsiDateTransformer()})
  createdAt: any;
  @UpdateDateColumn({type: "timestamp" , transformer: new ShamsiDateTransformer()})
  updatedAt: any;
  @DeleteDateColumn({type: "timestamp" , transformer: new ShamsiDateTransformer()})
  deletedAt: any;
}
