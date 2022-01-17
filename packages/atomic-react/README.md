# Atomic React

A React component library for building modern UIs interfacing with the Coveo platform. Atomic React is a wrapper around the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web component library.

The integration of React-based projects (using JSX) with Web based components can be tricky. This project is meant to address this issue, making it possible to use Atomic web-components in a manner that feels more natural to developers familiar with React.

## Installation

`npm i @coveo/atomic-react`

## Usage

Since Atomic React is built on top of the core [Atomic](https://docs.coveo.com/en/atomic/latest/) web-components library, the vast majority of concepts that apply to core Atomic will apply to Atomic React.

However, there are still some special considerations.

## Static Assets - Languages and SVGs

For performance reasons, the generated JavaScript bundle does not automatically include static assets that are loaded on demand. This impacts language support, as well as the use of included SVG icons.

It is mandatory that you make available external assets distributed with Atomic React by including them in the public directory of your app. Without this, for example, labels in the app will appear as temporary placeholders.

The location of the public directory depends on how you build, configure and distribute your app.

For example, for any project created with [Create React App](https://github.com/facebook/create-react-app), this would mean copying language and icon assets to the `./public` directory.

```
cp -r node_modules/@coveo/atomic-react/dist/assets public/assets
cp -r node_modules/@coveo/atomic-react/dist/lang public/lang
```

It is important to respect the folder hierarchy, with SVG icons under the `assets` subdirectory, and labels and languages under the `lang` subdirectory of the public folder.

## Styling Result Template Components

Due to the way Atomic Web components use [Shadow Dom](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) and [CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) to provide encapsulation, it is necessary to follow these guidelines when you wish to style elements inside any result templates.

### Option 1 -- Using Higher-Order Components (HOC)

This option works well if you do not need to create any CSS rule that would need to target the Shadow parts of an Atomic result component.

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

This approach lets you wrap any core Atomic component inside a styled one, which you can then re-use in one or more templates.
This could be done with inline styling as shown here, or with more advanced techniques such as using CSS modules.

Using `React.ComponentProps<typeof AnyAtomicComponent>` allows you to extract any props that the core component exposes, and augment them if need be.

### Option 2 -- Using a style tag

This option works in all scenarios, and allows you to target any Shadow parts that an Atomic result component exposes, in a similar manner to using plain HTML.

The following is an example that makes the text of an `AtomicResultBadge` pink:

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
