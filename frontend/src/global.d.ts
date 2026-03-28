declare var global: NodeJS.Global;


declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeInTheDocument(): R;
    }
  }
}
