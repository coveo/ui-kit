/* eslint-disable */

// @ts-ignore
const withFunction = (WrappedComponent) => {
  // @ts-ignore
  return (props) => {
    const {userFunction} = props;

    if (!userFunction) {
      throw new Error('You must provide a userFunction');
    }

    return <WrappedComponent {...props} userFunction={userFunction} />;
  };
};

// @ts-ignore
const MyComponent = ({userFunction}) => (
  <button onClick={() => userFunction('Hello!')}>Call User Function</button>
);

export const MyProvider = ({children}: {children: React.ReactNode}) => {
  return <div>{children}</div>;
};
