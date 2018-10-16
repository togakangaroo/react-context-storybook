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
           ...repeat(5)(i => create(Star, {active: i < rating}))
      )

const ReviewSummary = ({name, rating}) => (
    <figure>
      <figcaption>{name}</figcaption>
      <StarRating rating={rating} starCount={5} />
    </figure>
)

const When = ({value, render}) => value ? render(value) : `Please Wait...`

const LoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(this.props.id === this.prevProps.id)
            return
        const review = await this.props.api.getReview(this.props.id)
        this.setState({review})
    }
    componentDidMount = () => this.componentDidUpdate()
}

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
# A Common Problem

I want to create a component that hits an api
                `}/>

            <Highlight className="javascript">{`
const DirectQueryLoadedReviewSummary = class extends React.Component {
    render = () => (
        {!this.state ? "Please Wait" : (
            <ReviewSummary {...this.state.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(!this.prevProps || (this.props.id === this.prevProps.id))
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
          <Highlight className="jsx">{`
const DirectQueryLoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(!this.prevProps || (this.props.id === this.prevProps.id))
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
          <Highlight className="jsx">{`
const ApiLoadedReviewSummary = class extends React.Component {
    render = () => (
        <When value={this.state} render={s => (
            <ReviewSummary {...s.review}/>
        )} />
    )
    componentDidUpdate = async (prevProps) => {
        if(!this.prevProps || (this.props.id === this.prevProps.id))
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
<ApiContext.Provider value={{getReviews: Promise.resolve([stubReview()])}}>
    <div>
        <h3>Any amount of items in between these</h3>
        <ApiContext.Consumer>{(api) =>
            <ApiLoadedReviewSummary api={api} />
        }</ApiContext.Consumer>
    </div>
</ApiContext.Provider>
                `}
          </Highlight>

          <ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
            <div>
              <h3>Any amount of items in between these</h3>
              <ApiContext.Consumer>{(api) =>
                <ApiLoadedReviewSummary api={api} />
              }</ApiContext.Consumer>
            </div>
          </ApiContext.Provider>
        </>
    )})

    .add(``, () => {
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
<ApiContext.Provider value={{getReviews: Promise.resolve([stubReview()])}}>
    <div>
        <h3>Any amount of items in between these</h3>
        <ApiContext.Consumer>{(api) =>
            <ApiLoadedReviewSummary api={api} />
        }</ApiContext.Consumer>
    </div>
</ApiContext.Provider>
                `}
          </Highlight>

          <ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
            <div>
              <h3>Any amount of items in between these</h3>
              <ApiContext.Consumer>{(api) =>
                <ApiLoadedReviewSummary api={api} />
              }</ApiContext.Consumer>
            </div>
          </ApiContext.Provider>
        </>
    )})



    .add(`basic`, () => (
        <>
          <Markdown source={`
# Welcome
better
            `}/>
          <ReviewSummary
            name={text(`name`, `Francine Periwinkle's Peticoat Blues`)}
            rating={number(`rating`, 3)} />
        </>
    ))
    .add(`loaded`, () => (
        <LoadedReviewSummary id={123} />
    ))
