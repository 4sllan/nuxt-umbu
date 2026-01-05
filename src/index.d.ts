declare module '#auth-utils' {
  export * from './runtime/passport/utils';
  export * from './runtime/sanctum/utils';
}
declare module '#auth-types' {
  export * from './runtime/types/shared';
  export * from './runtime/types/core/state';
  export * from './runtime/types/providers/passport';
  export * from './runtime/types/providers/sanctum';
}
