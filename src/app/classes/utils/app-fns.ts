export class AppFns {
  static typeGuard(obj: any, propNames: string[]) {
    return propNames.every((prop: string) => prop in obj);
  }
}
