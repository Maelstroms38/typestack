import { InputType, Field } from 'type-graphql';

@InputType()
export class PlaceInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  userId: number;
}
