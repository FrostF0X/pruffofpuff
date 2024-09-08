import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
@Entity()
export class ComputeValueJobResult {
  @PrimaryGeneratedColumn()
  id: number;

  // Store the base64 PNG image as a string
  @Column({
    type: "text", // Use "text" to store a potentially large base64 string
  })
  input: string;

  // Store the result as an array of strings
  @Column({
    type: "text", // Use "text" for string array
    array: true,
    nullable: true, // Allow null in case the result isn't available yet
  })
  result: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
