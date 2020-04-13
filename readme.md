# Twitter Search

> Instantly search across your entire Twitter history with a beautiful UI powered by Algolia. ([link](https://twitter-search.io))

[![Build Status](https://travis-ci.com/saasify-sh/twitter-search.svg?branch=master)](https://travis-ci.com/saasify-sh/twitter-search) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<a href="https://twitter-search.io">
  <p align="center">
    <img src="https://raw.githubusercontent.com/saasify-sh/twitter-search/master/media/screenshot-search-ui-0.jpg" alt="Screenshot of search UI" />
  </p>
</a>

## Features

- 💯 **Open source**
- 🙈 [Hosted version](https://twitter-search.io) provided by [Saasify](https://saasify.sh)
- 🙉 Self-hosted version is easy to set up
- 🐳 Built using [Algolia](https://www.algolia.com), [Twitter API](https://developer.twitter.com/en/docs), and [ZEIT](https://zeit.co)
- 💪 Scales pretty nicely via serverless magics
- 🤖 Includes an auto-generated OpenAPI spec
- 👍 Super simple -- Algolia and Saasify do all the hard work for us

## Saasify

**[This entire product](https://twitter-search.io) was built and launched in around 8 hours**.

The only reason it was possible to build a production-quality SaaS MVP this quickly was because [Saasify](https://saasify.sh) handled all of the tedious parts, including:

- User accounts
- Stripe billing
- Auto-generated marketing site
- API authentication
- Twitter OAuth
- Rate limiting
- Caching
- Legal docs
- Monitoring
- Lots of glue and book-keeping

All of this functionality and most of the UI was auto-generated from this simple [saasify.json](https://github.com/saasify-sh/twitter-search/blob/master/saasify.json) config file.

The key is that Saasify handles all of this boilerplate for you, allowing you to focus solely on your product's **unique value proposition**.

### Implementation

[Twitter Search's](https://twitter-search.io) unique value prop comes in the form of two pieces: a REST API that handles the core functionality ([src/](./src)) and a webapp for the UI ([web/](./web)).

The REST API is written in TypeScript using [Koa](https://koajs.com) and [tsoa](https://github.com/lukeautry/tsoa). Each API endpoint receives some custom headers from Saasify's API proxy that let it know everything about the authenticated user making the request.

These headers include:

- `x-saasify-user` - String ID of the authenticated user making the API call.
- `x-saasify-plan` - String slug of the pricing plan this user is subscribed to.
- Additional headers specific to Twitter OAuth

The embedded webapp can be viewed from the [dashboard](https://twitter-search.io) and is a standard Create React App written in JavaScript. It's embedded in an iframe within Saasify's auto-generated host SPA which informs the webapp of the details for the authenticated user via a small JS script called [saasify-sdk](https://github.com/saasify-sh/saasify/tree/master/packages/saasify-sdk).

The React webapp also uses [Chakra UI](https://chakra-ui.com) as a beautiful and lightweight component library.

Of course, this product's core feature set wouldn't be possible without [Algolia](https://www.algolia.com/) powering the search and [ZEIT](https://zeit.co) hosting the serverless API and embedded static webapp.

### Looking to the future

The way this product was built may sound a bit complicated and it's definitely not as simple as we'd like at the moment. Even so, we hope it provides a good example of Saasify's potential to help developers quickly get their ideas off the ground.

Our team is working very hard to improve the developer experience that Saasify provides, and we hope to make this type of integration much simpler in the coming months. Feel free to follow our progress via our [open source repo](https://github.com/saasify-sh/saasify).

Some of the related roadmap items that I'm particularly excited about include:

- A **visual template editor** that simplifies onboarding ala Shopify.
- The ability to **eject** from our hosted SaaS boilerplate and fully customize your product.
- Breaking out the current monolithic React frontend into **embeddable blocks** that you can use with any website or framework.
- Continuing to **build a strong community** of successful Indie SaaS makers who have used Saasify to get their ideas to market.

If you want to learn more about how Saasify works and experiment with rapidly launching your own SaaS products, check out our [docs](https://docs.saasify.sh) and feel free to [get in touch](https://docs.saasify.sh/#/support).

## License

MIT © [Saasify](https://saasify.sh)
