declare module '#auth-utils' {
  export * from '#runtime/passport/utils';
  export * from '#runtime/sanctum/utils';
}
declare module '#auth-types' {
  export * from '#types/shared';
  export * from '#types/core/state';
  export * from '#types/providers/passport';
  export * from '#types/providers/sanctum';
}
