# Atomic React

A React component library for building modern UIs interfacing with the Coveo platform. Atomic React is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library.

Since the integration of React based project (using JSX), with Web based components can be tricky, this project exists to make it possible to use Atomic web-components in a manner that feels more natural to developers familiar with React.

## Installation

`npm i @coveo/atomic-react`

## Usage

Since Atomic React is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concept that applies to core Atomic will apply to Atomic React.

However, there are still some special consideration.

## Static assets - Languages and SVG

For performance reasons, the generated JavaScript bundle does not automatically include static assets that are loaded on demand. This include language support, as well being able to use included SVG icons.

It is mandatory that you make available external assets distributed with Atomic React to the public directory in your app. Without this, for example, labels in the app will appear as temporary placeholders.

The location of the public directory is dependent on how the app is built, configured and distributed.

For example, for any project created with [Create React App](https://github.com/facebook/create-react-app), this would mean copying languages and icons assets to the `./public` directory.

```
cp -r node_modules/@coveo/atomic-react/dist/assets public/assets
cp -r node_modules/@coveo/atomic-react/dist/lang public/lang
```

It is important to respect the folder hierarchy, with SVG icons under the `assets` subdirectory, and labels and languages under the `lang` subdirectory of the public folder.

## Styling result templates components

Due to the way Atomic Web components uses [Shadow Dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) and [CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) to provide encapsulation, it is necessary to follow these guidelines when you wish to style elements inside any result templates.

### Option 1 -- Using Higher-Order Components (HOC)

This option will work well if you do not need to create any CSS rule that would need to target the Shadow parts of an Atomic Result components.

For example, if you want to modify the color of all result links in a template to `pink`, you could do so like this:

```jsx
const MyStyledResultLink: React.FC<
  React.ComponentProps<typeof AtomicResultLink>
> = (props) => {
  return (
    <AtomicResultLink {...props} style={{color: 'pink'}}>
      {props.children}
    </AtomicResultLink>
  );
};

const MyPage = () => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList>
        <AtomicResultTemplate>
          <MyStyledResultLink />
        </AtomicResultTemplate>
      </AtomicResultList>
    </AtomicSearchInterface>
  );
};
```

This approach let's you wrap any core Atomic component inside a "styled" one, which you can then re-use in one or multiple template.
This could be done with inline style as shown here, or more advanced technique such as using CSS modules.

Using `React.ComponentProps<typeof AnyAtomicComponent>` allows to extract any props the core component expose, and augment them if need be.

### Option 2 -- Using a style tag

This option will work in all scenarios, and will allow to target any Shadow parts that an Atomic result component expose, in a similar manner that would be possible using plain HTML.

This is an example of how it would look like if you wanted to make the text of an `AtomicResultBadge` pink:

```jsx
const myStyles = `
atomic-result-badge::part(result-badge-element) {
    color: pink;
}
`;

const MyPage = () => {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicResultList>
        <style>{myStyles}</style>
        <AtomicResultTemplate>
          <AtomicResultBadge />
        </AtomicResultTemplate>
      </AtomicResultList>
    </AtomicSearchInterface>
  );
};
```
