import React from 'react'
import Markdown from 'react-markdown'

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import styled from 'styled-components'
import { withKnobs, number, text, boolean } from '@storybook/addon-knobs';

import Highlight from 'react-highlight'
import 'highlight.js/styles/a11y-dark.css'

const create = React.createElement
const repeat = num => function * (fn) {
    for(let n = 0; n < num; n++)
        yield fn(n)
}

const resolveIn = ms => value => new Promise(resolve =>
    setTimeout(() => resolve(value), ms)
)

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
    border:0 none;
    clip:rect(0px,0px,0px,0px);
    height:1px;
    margin:-1px;
    overflow:hidden;
    padding:0;
    position:absolute;
    width:1px
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

storiesOf(`Presentation`)
    .addDecorator(withKnobs)
    .add(`Intro`, () => render(
        md(`
            # React Context, Storybook and Other Tips

            ## George Mauer - @togakangaroo

            **I just wrote this!**

            [Code is here](https://github.com/togakangaroo/react-context-storybook/tree/master)

            [View this online here](http://georgemauer.net/react-context-storybook/storybook-static)
        `)
    ))

    .add(`A common problem`, () => render(
        md(`
            # A Common Problem

            I want to create a component that hits an api
        `)
    ))

    .add(`Basic direct query component`, () => render(
        md(`
            # Tip: All Components Should Either Do Stuff Or Render Stuff, **Not** Both
        `),
        code(`
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
        `)
    ))

    .add(`Create When`, () => render(
        md(`
            # Tip: Create a \`When\` component
        `),
        code(`
            const When = ({value, render}) => (
                value ? render(value) : \`Please Wait...\`
            )
        `)
    ))

    .add(`Use When`, () => render(
        md(`
            # Tip: Create a \`When\` component
        `),
        code(`
            const When = ({value, render}) => (
                value ? render(value) : \`Please Wait...\`
            )
        `),
        code(`
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
        `),
    ))

    .add(`Stub the entire Api method`, () => render(
        md(`
            # Tip: Stub the entire Api method
        `),
        code(`
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
        `),
        md(`
            But how to actually pass down that \`api\` property?
        `)
    ))

    .add(`Context Demo`, () => {
        const DemoContext = React.createContext(null)
        const Demo = () => (
            <DemoContext.Consumer>{(value) =>
                <i>Our value: {value}</i> 
            }</DemoContext.Consumer>
        )

        return render(
            md(`
                # Create a React Context
            `),
            code(`
                const DemoContext = React.createContext(null)
            `),
            md(`
                ## Usage
            `),
            code(`
                const DemoConsumer = () => (
                    <DemoContext.Consumer>{(value) =>
                        <i>Our value: {value}</i> 
                    }</DemoContext.Consumer>
                )
            `),
            code(`
                <DemoContext.Provider value={text("provided value", "abc")}>
                    <figure>
                        <figcaption>Any amount of items in between these</figcaption>
                        <Demo />
                    </figure>
                </DemoContext.Provider>
            `),
            md(`
                That's it!
            `), (
                <DemoContext.Provider value={text("provided value", "abc")}>
                    <figure>
                        <figcaption>Any amount of items in between these</figcaption>
                        <Demo />
                    </figure>
                </DemoContext.Provider>
            ),
            md(`
                (Also, knobs is pretty cool check out the knobs panel below ↓)
            `)
        )
    })

    .add(`Static Scoping`, () => render(
        md(`
            # Javascript Has Static / Lexical Scope

            **Interview question time!**
        `),
        code(`
            let a = 1
            let b = 2

            const fn2 = () => {
                a = 3
            }

            const fn1 = () => {
                let a = 4
                b = 3
                fn2()
            }

            fn1(a)

            console.log(a) // 3
            console.log(b) // 3
        `)
    ))

    .add(`Dynamic Scoping`, () => render(
        md(`
            # Dynamic Scoping

            * Rarer
            * Can make things incredibly extensible
        `),
        <figure style={{display: `flex`, alignItems: `flex-start`}}>
            <Growing>
              {code(`
                let a = 1
                let b = 2

                const fn2 = () => {
                    a = 3
                }

                const fn1 = () => {
                    let a = 4
                    b = 3
                    fn2()
                }

                fn1()

                console.log(a) // 1
                console.log(b) // 3
              `)}
            </Growing>
            <ShrinkingImg src="/dynamic_scoping.png" style={{width: `40%`}} />
        </figure>
    ))

    .add(`Opt-in Dynamic Scoping`, () => render(
        <Stack>
            {md(`
                # Dynamic Scoping is Confusing

                But Opt-In dynamic scoping...is _awesome_
            `)}
             <GrowingImg src="trex-samurai.jpg" />
        </Stack>
    ))

    .add(`Context With Api`, () => {
        const ApiContext = React.createContext(null)
        return render(
            md(`
                # Create a React Context
            `),
            code(`
                const ApiContext = React.createContext(null)
            `),
            md(`
                ## Usage
            `),
            code(`
                <ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
                    <ApiContext.Consumer>{(api) =>
                        <ApiLoadedReviewSummary api={api} id={123} />
                    }</ApiContext.Consumer>
                </ApiContext.Provider>
            `),
            <ApiContext.Provider value={{getReviews: () => Promise.resolve(stubReview())}}>
                <ApiContext.Consumer>{(api) =>
                    <ApiLoadedReviewSummary api={api} id={123} />
                }</ApiContext.Consumer>
            </ApiContext.Provider>
        )
    })

    .add(`Without providers`, () => {
        const ApiContext = React.createContext({
            getReviews: () => Promise.resolve(stubReview())
        })
        return render(
            md(`
                # Setting Providers is a Pain

                So provide a default value instead.
            `),
            code(`
                const ApiContext = React.createContext({
                    getReviews: Promise.resolve(stubReview())
                })
            `),
            md(`
                ## Usage
            `),
            code(`
                <ApiContext.Consumer>{(api) =>
                    <ApiLoadedReviewSummary api={api} id={123} />
                }</ApiContext.Consumer>
            `),
          <ApiContext.Consumer>{(api) =>
            <ApiLoadedReviewSummary api={api} id={123} />
          }</ApiContext.Consumer>
        )
    })

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

        return render(
            md(`
                # Tip: Create an ApiContext Higher Order Component (HoC)
            `),
            code(`
                const withApiContext = (Component) => (props) => (
                    <ApiContext.Consumer>{(api) =>
                        <Component api={api} {...props} />
                    }</ApiContext.Consumer>
                )
            `),
            code(`
                const LoadedReviewSummary = withApiContext(ApiLoadedReviewSummary)
            `),
            md(`
                Can now be used transparently
            `),
            code(`
                <LoadedReviewSummary id={456} />
            `),
            <LoadedReviewSummary id={456} />
        )
    })


    .add(`Delayed Promise Resolver`, () => {
        const ApiContext = React.createContext({
            getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
        })
        const withApiContext = (Component) => (props) => (
            <ApiContext.Consumer>{(api) =>
                <Component api={api} {...props} />
            }</ApiContext.Consumer>
        )
        const LoadedReviewSummary = withApiContext(ApiLoadedReviewSummary)

        return render(
            md(`
                # Tip: Create a Promise Reolver You Can Control

                To test what what it looks like while loading
            `),
            code(`
                const resolveIn = ms => value => new Promise(resolve =>
                    setTimeout(() => resolve(value), ms)
                )
                const ApiContext = React.createContext({
                    getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
                })
            `),
            code(`
                <LoadedReviewSummary id={456} />
            `),
            <LoadedReviewSummary id={456} />
        )
    })

    .add(`Maybe not Jsx`, () => render(
        md(`
            # Tip: You don't *always* need Jsx

            Some things are significantly easier without it
        `),
        code(`
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
                border:0 none;
                clip:rect(0px,0px,0px,0px);
                height:1px;
                margin:-1px;
                overflow:hidden;
                padding:0;
                position:absolute;
                width:1px
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
        `)
    ))

    .add(`Auto unmount`, () => {
        const ApiContext = React.createContext({
            getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
        })

        const proxyPromise = (promise, {beforeCompletion}) => new Promise((resolve, reject) =>
            promise.then(beforeCompletion(resolve), beforeCompletion(reject))
        )
        const propsToObject = (props, createValue) =>
              Object.fromEntries(props.map(prop => [prop, (...args) => createValue(prop, ...args)]))

        const withApiContext = (...apiPropNames) => (Component) =>
              class extends React.Component {
                  render = () => (
                      <ApiContext.Consumer>{(contextApi) => {
                          const api = propsToObject(apiPropNames,
                            (prop, ...args) => proxyPromise(contextApi[prop](...args), {beforeCompletion: this.ifMounted})
                          )
                          return (
                              <Component api={api} {...this.props} />
                          )
                      }}</ApiContext.Consumer>
                  )
                  ifMounted = fn => (...args) => !this.isUnmounted && fn(...args)
                  componentWillUnmount = () => {
                      this.isUnmounted = true
                  }
              }
        const LoadedReviewSummary = withApiContext(`getReviews`)(ApiLoadedReviewSummary)
        return render(
            md(`
                # More Complex Things

                With our \`withApiContext\` HoC we now have hooks to do other interesting things

                * Let's force people to be explicit about what apis they want to use
                * Let's never resolve any promises if our HoC is unmounted

                Do this by creating a new api object to pass down to the component. This will only have the functions requested and
                proxy the promise with its own version that will only resolve if the component is not mounted
            `),
            code(`
                const ApiContext = React.createContext({
                    getReviews: () => resolveIn(number("Loading delay", 5000))(stubReview())
                })

                const proxyPromise = (promise, {beforeCompletion}) => new Promise((resolve, reject) =>
                    promise.then(beforeCompletion(resolve), beforeCompletion(reject))
                )
                const propsToObject = (props, createValue) =>
                        Object.fromEntries(props.map(prop => [prop, (...args) => createValue(prop, ...args)]))

                const withApiContext = (...apiPropNames) => (Component) =>
                        class extends React.Component {
                            render = () => (
                                <ApiContext.Consumer>{(contextApi) => {
                                    const api = propsToObject(apiPropNames,
                                    (prop, ...args) => proxyPromise(contextApi[prop](...args), {beforeCompletion: this.ifMounted})
                                    )
                                    return (
                                        <Component api={api} {...this.props} />
                                    )
                                }}</ApiContext.Consumer>
                            )
                            ifMounted = fn => (...args) => !this.isUnmounted && fn(...args)
                            componentWillUnmount = () => {
                                this.isUnmounted = true
                            }
                        }
                const LoadedReviewSummary = withApiContext("getReviews")(ApiLoadedReviewSummary)
            `),
              !boolean("currently mounted", true) ? null :
                <LoadedReviewSummary id={123} />
        )
    })

    .add(`Storybook`, () => render(
        md(`
            # Thoughts on [Storybook](https://storybook.js.org/)

            * Very powerful "playground" tool - REPL-Driven-Development
            * Fast to set up for standard architectures
            * Great for component gallery
            * Can do some of what TDD does

            **Also**

            * Clearly this presentation is cool
       `)
      ))

const trimLead = str => {
    const line1 = str.split('\n')[1]
    const leadingSpace = /^\s*/.exec(line1)[0]
    return str.replace(new RegExp(`\n${leadingSpace}`, 'g'), '\n').trim()
}
const md = source => create(Markdown, {source: trimLead(source)})
const code = (source, className="javascript") => create(Highlight, {className}, trimLead(source))
const render = (...elements) => create(React.Fragment, null, ...elements)

const FlexContainer = styled.div`
    display: flex;
`
const Stack = styled(FlexContainer)`
    flex-direction: column
`
const AutosizeImg = styled.img`
    height: fill-available;
    object-fit: contain;
    object-position: top;
`
const Growing = styled.div`
    flex-grow: 1;
`
const GrowingImg = styled(AutosizeImg)`
    flex-grow: 1;
`
const ShrinkingImg = styled(AutosizeImg)`
    flex-shrink: 1;
`
