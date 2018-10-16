import React from 'react'
import Markdown from 'react-markdown'

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import styled from 'styled-components'
import { withKnobs, number, text } from '@storybook/addon-knobs';

import Highlight from 'react-highlight'
import 'highlight.js/styles/a11y-dark.css'

const create = React.createElement
const repeat = num => function * (fn) {
    for(let n = 0; n < num; n++)
        yield fn(n)
}

const stubReview = () => ({
    name: text(`name`, `Francine Periwinkle's Peticoat Blues`),
    rating: number(`rating`, 3),
})

const ActiveStar = styled.i`
    color: gold;
`
const InactiveStar = styled.i`
    color: gray;
`

const Star = ({active}) => create(active ? ActiveStar : InactiveStar, {}, `★`)

const StarRatingContainer = styled.div`
    font-size: 50px;
    display: flex;
    align-items: center;
`

const HiddenInput = styled.input`
    visibility: hidden;
    height: 0;
    width: 0;
`
const StarRatingInput = ({rating, starCount=5}) => (
    <HiddenInput type="range" min={0} max={starCount} value={rating} readOnly={true} />
)

const StarRating = ({rating, starCount=5}) =>
      create(StarRatingContainer, null,
           create(StarRatingInput, {rating, starCount}),
           ...repeat(starCount)(i => create(Star, {active: i < rating}))
      )

const ReviewSummary = ({name, rating}) => (
    <figure>
      <figcaption>{name}</figcaption>
      <StarRating rating={rating} starCount={5} />
    </figure>
)

const When = ({value, render}) => value ? render(value) : `Please Wait...`

const ApiLoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review} />
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(prevProps && (this.props.id === prevProps.id))
            return
        const review = await this.props.api.getReviews(this.props.id)
        this.setState({review})
    }
    componentDidMount = () => this.componentDidUpdate()
}

storiesOf(`My presentation`)
    .addDecorator(withKnobs)
    .add(`Intro`, () => (
        <Markdown source={`
# React Context, Storybook and Other Tips

## George Mauer - @togakangaroo

**I just wrote this!**
`}/>
    ))
    .add(`A common problem`, () => (
        <Markdown source={`
# A Common Problem

I want to create a component that hits an api
            `}/>
    ))

    .add(`Basic direct query component`, () => (
        <>

            <Markdown source={`
# Tip: All Components Should Either Do Stuff Or Render Stuff, **Not** Both
                `}/>

            <Highlight className="javascript">{`
const ReviewSummary = ({name, rating}) => (
    <figure>
      <figcaption>{name}</figcaption>
      <StarRating rating={rating} starCount={5} />
    </figure>
)

const DirectQueryLoadedReviewSummary = class extends React.Component {
    render = () => (
        {!this.state ? "Please Wait" : (
            <ReviewSummary {...this.state.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(prevProps && (this.props.id === prevProps.id))
            return
        const review = await fetch('/api/reviews' + this.props.id).then(x => x.json())
        this.setState({review})
    }
    componentDidMount = () => this.componentDidUpdate()
}
                `}</Highlight>
        </>
    ))

    .add(`Create When`, () => (
        <>
          <Markdown source={`
# Tip: Create a \`When\` component
                `}/>
          <Highlight className="javascript">{`
const When = ({value, render}) => (
    value ? render(value) : \`Please Wait...\`
)
                `}</Highlight>
        </>
    ))

    .add(`Use When`, () => (
        <>
          <Markdown source={`
# Tip: Create a \`When\` component
                `}/>
          <Highlight className="javascript">{`
const When = ({value, render}) => (
    value ? render(value) : \`Please Wait...\`
)
                `}</Highlight>
          <Highlight className="jsx">{`
const DirectQueryLoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(prevProps && (this.props.id === prevProps.id))
            return
        const review = await fetch('/api/reviews' + this.props.id).then(x => x.json())
        this.setState({review})
    }
    componentDidMount = () => this.componentDidUpdate()
}
                `}</Highlight>
        </>
    ))

    .add(`Stub the entire Api method`, () => (
        <>
          <Markdown source={`
# Tip: Stub the entire Api method
                `}/>
          <Highlight className="javascript">{`
const ApiLoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(prevProps && (this.props.id === prevProps.id))
            return
        const review = await this.props.api.getReviews(this.props.id)
        this.setState({review})
    }
    componentDidMount = () => this.componentDidUpdate()
}
                `}</Highlight>
          <Markdown source={`
But how to actually pass down that \`api\` property?
                `}/>
        </>
    ))


    .add(`Context Demo`, () => {
        const DemoContext = React.createContext(null)
        const Demo = () => (
            <DemoContext.Consumer>{(value) =>
                <i>Our value: {value}</i> 
            }</DemoContext.Consumer>
        )
        return (
        <>
          <Markdown source={`
# Create a React Context
                `}/>
          <Highlight className="jsx">{`
const DemoContext = React.createContext(null)
                `}</Highlight>
          <Markdown source={`
## Usage
                `}/>
          <Highlight className="jsx">
            {`
const DemoConsumer = () => (
    <DemoContext.Consumer>{(value) =>
        <i>Our value: {value}</i> 
    }</DemoContext.Consumer>
)
                `}
          </Highlight>
          <Highlight className="jsx">
            {`
<DemoContext.Provider value={text("provided value", "abc")}>
    <figure>
        <figcaption>Any amount of items in between these</figcaption>
        <Demo />
    </figure>
</DemoContext.Provider>
                `}
          </Highlight>
          <Markdown source={`
That's it!
                `}/>

          <DemoContext.Provider value={text("provided value", "abc")}>
            <figure>
              <figcaption>Any amount of items in between these</figcaption>
              <Demo />
            </figure>
          </DemoContext.Provider>
        </>
    )})

    .add(`Static Scoping`, () => (
        <>
            <Markdown source={`
# Javascript Has Static/Lexical Scope

**Interview question time!**
                `}/>
        <Highlight className="jsx">{`
let a = 1
let b = 2

const fn2 = () => {
    a = 3
}

const fn1 = (a) => {
    a = 4
    b = 3
    fn1()
}

fn2(a)

console.log(a)
console.log(b)
                `}</Highlight>
        </>
    ))

    .add(`Dynamic Scoping`, () => (
        <>
          <Markdown source={`
# Dynamic Scoping

* Rarer
* Can make things incredibly extensible
                `}/>
          <figure style={{display: `flex`, alignItems: `flex-start`}}>
            <div style={{flex: `1`}}>
                <Highlight className="jsx">{`
let a = 1
let b = 2

const fn2 = () => {
    a = 3
}

const fn1 = (a) => {
    a = 4
    b = 3
    fn1()
}

fn2(a)

console.log(a)
console.log(b)
                    `}</Highlight>
                </div>
                <img src="/dynamic_scoping.png" style={{width: `40%`, objectFit: 'contain'}} />
            </figure>
        </>
    ))

    .add(`Opt-in Dynamic Scoping`, () => (
        <>
          <div style={{display: `flex`, flexDirection: `column`}}>
            <Markdown source={`
# Dynamic Scoping is Confusing

But Opt-In dynamic scoping...is awesome
                `}/>
            <img src="trex-samurai.jpg" style={{flex: `1`, height: `-webkit-fill-available`}} />
         </div>
        </>
    ))


    .add(`Context With Api`, () => {
        const ApiContext = React.createContext(null)
        return (
        <>
          <Markdown source={`
# Create a React Context
                `}/>
          <Highlight className="jsx">{`
const ApiContext = React.createContext(null)
                `}</Highlight>
          <Markdown source={`
## Usage
                `}/>
          <Highlight className="jsx">
            {`
<ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
    <ApiContext.Consumer>{(api) =>
      <ApiLoadedReviewSummary api={api} id={123} />
    }</ApiContext.Consumer>
</ApiContext.Provider>
                `}
          </Highlight>

          <ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
            <ApiContext.Consumer>{(api) =>
              <ApiLoadedReviewSummary api={api} id={123} />
            }</ApiContext.Consumer>
          </ApiContext.Provider>
        </>
    )})

    .add(`Without providers`, () => {
        const ApiContext = React.createContext({
            getReviews: () => Promise.resolve(stubReview())
        })
        return (
        <>
          <Markdown source={`
# Setting Providers is a Pain

So provide a default value instead.
                `}/>
          <Highlight className="jsx">{`
const ApiContext = React.createContext({
    getReviews: Promise.resolve(stubReview())
})
                `}</Highlight>
          <Markdown source={`
## Usage
                `}/>
          <Highlight className="jsx">
            {`
<ApiContext.Consumer>{(api) =>
    <ApiLoadedReviewSummary api={api} id={123} />
}</ApiContext.Consumer>
                `}
          </Highlight>

          <ApiContext.Consumer>{(api) =>
            <ApiLoadedReviewSummary api={api} id={123} />
          }</ApiContext.Consumer>
        </>
    )})

    .add(`Create HoC`, () => {
        const ApiContext = React.createContext({
            getReviews: () => Promise.resolve(stubReview())
        })
        const withApiContext = (Component) => (props) => (
            <ApiContext.Consumer>{(api) =>
                <Component api={api} {...props} />
            }</ApiContext.Consumer>
        )
        const LoadedReviewSummary = withApiContext(ApiLoadedReviewSummary)

        return (
            <>
              <Markdown source={`
# Tip: Create an ApiContext Higher Order Component (HoC)
                `}/>
              <Highlight className="jsx">{`
const withApiContext = (Component) => (props) => (
    <ApiContext.Consumer>{(api) =>
        <Component api={api} {...props} />
    }</ApiContext.Consumer>
)
                `}</Highlight>
              <Highlight className="jsx">{`
const LoadedReviewSummary = withApiContext(ApiLoadedReviewSummary)
                `}</Highlight>
              <Markdown source={`
Can now be used transparently
                `}/>
              <Highlight className="jsx">
                {`
<LoadedReviewSummary id={456} />
                `}
              </Highlight>

              <LoadedReviewSummary id={456} />
            </>
        )})


    .add(`Delayed Promise Resolver`, () => {
        const resolveIn = ms => value => new Promise(resolve =>
            setTimeout(() => resolve(value), ms)
        )
        const ApiContext = React.createContext({
            getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
        })
        const withApiContext = (Component) => (props) => (
            <ApiContext.Consumer>{(api) =>
                <Component api={api} {...props} />
            }</ApiContext.Consumer>
        )
        const LoadedReviewSummary = withApiContext(ApiLoadedReviewSummary)

        return (
            <>
              <Markdown source={`
# Tip: Create a Promise Reolver You Can Control

To test what what it looks like while loading
                `}/>
              <Highlight className="jsx">{`
const resolveIn = ms => value => new Promise(resolve =>
    setTimeout(() => resolve(value), ms)
)
const ApiContext = React.createContext({
    getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
})
                `}</Highlight>
              <Highlight className="jsx">
                {`
<LoadedReviewSummary id={456} />
                `}
              </Highlight>

              <LoadedReviewSummary id={456} />
            </>
        )})

    .add(`Maybe not Jsx`, () => (
        <>
          <Markdown source={`
# Tip: You don't *always* need Jsx

Some things are significantly easier without it
                `}/>

          <Highlight className="javascript">
            {`
const ActiveStar = styled.i\`
    color: gold;
\`
const InactiveStar = styled.i\`
    color: gray;
\`

const Star = ({active}) => create(active ? ActiveStar : InactiveStar, {}, \`★\`)

const StarRatingContainer = styled.div\`
    font-size: 50px;
    display: flex;
    align-items: center;
\`

const HiddenInput = styled.input\`
    visibility: hidden;
    height: 0;
    width: 0;
\`
const StarRatingInput = ({rating, starCount=5}) => (
    <HiddenInput type="range" min={0} max={starCount} value={rating} readOnly={true} />
)

const create = React.CreateElement
const StarRating = ({rating, starCount=5}) =>
    create(StarRatingContainer, null,
        create(StarRatingInput, {rating, starCount}),
            ...repeat(starCount)(i => create(Star, {active: i < rating}))
    )

const ReviewSummary = ({name, rating}) => (
    <figure>
        <figcaption>{name}</figcaption>
        <StarRating rating={rating} starCount={5} />
    </figure>
)
          `}
          </Highlight>
        </>
    ))

    .add(`Storybook`, () => (
        <>
          <Markdown source={`
# Thoughts on [Storybook](https://storybook.js.org/)

* Very powerful "playground" tool - REPL-Driven-Development
* Fast to set up for standard architectures
* Great for component gallery
* Can do some of what TDD does

Also

* Clearly this is great
                `}/>
        </>
    ))
