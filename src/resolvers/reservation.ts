import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

import { Reservation } from "../entities/Reservation";
import { MyContext } from "../types";

@Resolver()
export class ReservationResolver {
  @Query(() => [Reservation])
  reservations(@Ctx() { em }: MyContext): Promise<Reservation[]> {
    return em.find(Reservation, {});
  }

  @Query(() => Reservation, { nullable: true })
  reservation(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Reservation | null> {
    return em.findOne(Reservation, { id });
  }

  @Mutation(() => Reservation)
  async createReservation(
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Reservation> {
    const reservation = em.create(Reservation, { title });
    await em.persistAndFlush(reservation);
    return reservation;
  }

  @Mutation(() => Reservation, { nullable: true })
  async updateReservation(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Reservation | null> {
    const reservation = await em.findOne(Reservation, { id });

    if (!reservation) {
      return null;
    }

    reservation.title = title;

    await em.persistAndFlush(reservation);
    return reservation;
  }

  @Mutation(() => Boolean)
  async deleteReservation(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Reservation, { id });
      return true;
    } catch {
      return false;
    }
  }
}
