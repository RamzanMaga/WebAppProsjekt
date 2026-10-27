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
