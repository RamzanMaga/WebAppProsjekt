//En rask og enkel mapper for å konvertere en User-objekt til et DTO (Data Transfer Object) som kan sendes til klienten. Dette gjør det enklere å håndtere dataene og beskytter sensitive opplysninger som passord og tokens fra å bli eksponert til klienten.
import type { User } from "@/db/schema";

export function toUserDTO(user: User) {
  return {
    id: user.id,
    firstName: user.firstName ?? user.name,
    lastName: user.lastName ?? "",
    email: user.email,
    buildingId: user.buildingId,
    floorId: user.floorId,

    role: user.role,
  };
}
