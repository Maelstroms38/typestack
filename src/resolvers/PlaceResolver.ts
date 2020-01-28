import { Resolver, Query, Arg, Mutation } from 'type-graphql';
import { plainToClass } from 'class-transformer';

import { Place } from '../entity/Place';
import { User } from '../entity/User';
import { PlaceInput } from '../graphql-types/PlaceInput';

@Resolver(() => Place)
export class PlaceResolver {
  @Query(() => Place, { nullable: true })
  async place(@Arg('id') id: number): Promise<Place | undefined> {
    return await Place.findOne(id);
  }

  @Query(() => [Place], {
    description: 'Get all the places from around the world '
  })
  async places(): Promise<Place[]> {
    const places = await Place.find();
    return places;
  }

  @Mutation(() => Place)
  async createPlace(@Arg('place') placeInput: PlaceInput): Promise<Place> {
    const user = await User.findOne(placeInput.userId);
    const place = plainToClass(Place, {
      description: placeInput.description,
      title: placeInput.title,
      imageUrl: placeInput.imageUrl,
      user: user,
      creationDate: new Date()
    });
    const newPlace = await Place.create({ ...place }).save();
    return newPlace;
  }
}
