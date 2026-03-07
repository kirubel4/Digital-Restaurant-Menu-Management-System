import { createElement, type ComponentType } from "react";
import { Role } from "@/types/auth.types";

export function withRoleGuard<T extends object>(Component: ComponentType<T>, _allowedRoles: Role[]) {
  return function GuardedComponent(props: T) {
    return createElement(Component, props);
  };
}
