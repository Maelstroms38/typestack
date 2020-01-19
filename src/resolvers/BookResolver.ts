import { Query, Resolver, Mutation, Arg } from 'type-graphql';
import { Book } from '../entity/Book';

@Resolver()
export class BookResolver {
  @Query(() => [Book])
  async books() {
    return await Book.find();
  }
  @Mutation(() => Book, { nullable: true })
  async createBook(
    @Arg('title') title: string,
    @Arg('author') author: string
  ): Promise<Book> {
    return await Book.create({ title, author }).save();
  }
}
