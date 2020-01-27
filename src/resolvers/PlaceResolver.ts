import { Resolver, Query, Arg, Mutation } from 'type-graphql';
import { plainToClass } from 'class-transformer';

import { Place } from '../entity/Place';
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
  async addPlace(@Arg('place') placeInput: PlaceInput): Promise<Place> {
    const place = plainToClass(Place, {
      description: placeInput.description,
      title: placeInput.title,
      creationDate: new Date()
    });
    await Place.create({ ...place }).save();
    return place;
  }
}
