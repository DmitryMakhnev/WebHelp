/*
 * It's hack for typescript compiler will be able to use css modules exports
 */

declare module '*.scss' {
  const content: any;
  export default content;
}
