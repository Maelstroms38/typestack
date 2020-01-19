import { InputType, Field } from 'type-graphql';

@InputType()
export class Book {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  author?: string;
}
