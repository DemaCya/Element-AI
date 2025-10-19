# Introduction

> Creem is the payment partner you always deserved, we strive for simplicity and straightforwardness on our APIs.

{/* <img
  className="block dark:hidden"
  src="/images/hero-light.svg"
  alt="Hero Light"
  /> */}

## Quickstart

The first step to start using Creem is to create an account and get your API key.

After that, feel free to explore our API reference for more details. Or to jump start into our straightforward tutorial.

<CardGroup cols={2}>
  <Card title="From 0 to Hero" icon="money-bill-trend-up" href="/quickstart">
    We'll guide you through the process of receiving your first payment in 10 minutes.
  </Card>

  <Card title="Webhooks" icon="webhook" href="/learn/webhooks/introduction">
    Understand how to receive updates on your application automatically.
  </Card>
</CardGroup>

## Guides

Create customers and subscriptions, manage your products, and much more. Check out our guides to get the most out of Creem.

<CardGroup cols={2}>
  <Card title="No-Code Payments" icon="credit-card-front" href="/quickstart">
    Receive payments without any code or integration.
  </Card>

  <Card title="Standard Integration" icon="basket-shopping" href="/checkout-flow">
    Create checkout sessions dynamically in your app
  </Card>
</CardGroup>

# Quickstart

> Learn how to receive your first payment in under 10 minutes

## Prerequisites

To get the most out of this guide, you'll need to:

* **Create an account on Creem.io**

## 1. Create a product

<Frame>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/pnGxjcbztH0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</Frame>

Go over to the [products tab](https://creem.io/dashboard/products) and create a product.
You can add a name, description, and price to your product. Optionally you can also add a picture to your product that will be shown to users.

<AccordionGroup>
  <Accordion icon="browser" title="Product page">
    <img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/add-product-B0Khh16pSFp3DpwsuBrrExvlwovhMq.png" />
  </Accordion>

  <Accordion icon="file-spreadsheet" title="Adding product details">
    <img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/product-details-49DpCmOXRIuUOYulQXxmY6moAISQ9b.png" />
  </Accordion>
</AccordionGroup>

## 2. Copy the payment link from the product

After successfully creating your product, you can copy the payment link by clicking on the product **Share** button.
Simply send this link to your users and they will be able to pay you instantly.

<img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/product-share-vrV42jh8mnhvpUs1AeSyLtuJLZmBJo.png" />

## More use cases

If you are not planning to do a no-code integration, we strongly encourage you to check out our other guides.

Create checkout-sessions and prices dynamically, use webhooks to receive updates on your application automatically, and much more. Check out our guides to get the most out of Creem.

<CardGroup>
  <Card title="Standard Integration" icon="basket-shopping" href="/checkout-flow">
    Understand what you will receive when users complete a payment and get redirected back to your website.
  </Card>

  <Card title="Webhooks and Events" icon="square-code" href="/learn/webhooks/introduction">
    Set up webhooks to receive updates on your application automatically.
  </Card>
</CardGroup>

# Introduction

> Use webhooks to notify your application about payment events."


## What is a webhook?

Creem uses webhooks to push real-time notifications to you about your payments and subscriptions. All webhooks use HTTPS and deliver a JSON payload that can be used by your application. You can use webhook feeds to do things like:

* Automatically enable access to a user after a successful payment
* Automatically remove access to a user after a canceled subscription
* Confirm that a payment has been received by the same customer that initiated it.

In case webhooks are not successfully received by your endpoint, creem automatically retries to send the request with a progressive backoff period of 30 seconds, 1 minute, 5 minutes and 1 hour.

## Steps to receive a webhook

You can start receiving real-time events in your app using the steps:

* Create a local endpoint to receive requests
* Register your development webhook endpoint on the Developers tab of the Creem dashboard
* Test that your webhook endpoint is working properly using the test environment
* Deploy your webhook endpoint to production
* Register your production webhook endpoint on Creem live dashboard

### 1. Create a local endpoint to receive requests

In your local application, create a new route that can accept POST requests.

For example, you can add an API route on Next.js:

```typescript  theme={null}
import type { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const payload = req.body;
    console.log(payload);
    res.status(200);
  }
};
```

On receiving an event, you should respond with an HTTP 200 OK to signal to Creem that the event was successfully delivered.

### 2. Register your development webhook endpoint

Register your publicly accessible HTTPS URL in the Creem dashboard.

<Tip>
  You can create a tunnel to your localhost server using a tool like ngrok. For example: [https://8733-191-204-177-89.sa.ngrok.io/api/webhooks](https://8733-191-204-177-89.sa.ngrok.io/api/webhooks)
</Tip>

<img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/test-webhook-yBodvIWasxCmgr4bYqZJBlWg8qbUD2.png" />

### 3. Test that your webhook endpoint is working properly

Create a few test payments to check that your webhook endpoint is receiving the events.

### 4. Deploy your webhook endpoint

After you’re done testing, deploy your webhook endpoint to production.

### 5. Register your production webhook endpoint

Once your webhook endpoint is deployed to production, you can register it in the Creem dashboard.

# Standard Integration

> Learn how to receive payments on your application

## Prerequisites

To get the most out of this guide, you'll need to:

* **Create an account on Creem.io**
* **Have your API key ready**

## 1. Create a product

Go over to the [products tab](https://creem.io/dashboard/products) and create a product.
You can add a name, description, and price to your product. Optionally you can also add a picture to your product that will be shown to users.

<AccordionGroup>
  <Accordion icon="browser" title="Product page">
    <img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/add-product-B0Khh16pSFp3DpwsuBrrExvlwovhMq.png" />
  </Accordion>

  <Accordion icon="file-spreadsheet" title="Adding product details">
    <img style={{ borderRadius: '0.5rem' }} src="https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/Screenshot%202024-10-03%20at%2015.51.45-arQ1KogX03W1cGCmTgMBSJFd8d8QYR.png" />
  </Accordion>
</AccordionGroup>

## 2 Create a checkout session

Once your product is created, you can copy the product ID by clicking on the product options and selecting "Copy ID".

Now grab your api-key and create a checkout session by sending a POST request to the following endpoint:

<Warning>
  If you are using test mode, make sure to use the test mode API endpoint. See the [Test Mode](/test-mode) page for more details.
</Warning>

<CodeGroup>
  ```bash getCheckout.sh theme={null}
  curl -X POST https://api.creem.io/v1/checkouts \
    -H "x-api-key: creem_123456789"
    -D '{"product_id": "prod_6tW66i0oZM7w1qXReHJrwg"}'
  ```

  ```javascript getCheckout.js theme={null}
      const redirectUrl = await axios.post(
        `https://api.creem.io/v1/checkouts`,
          {
            product_id: 'prod_6tW66i0oZM7w1qXReHJrwg',
          },
          {
            headers: { "x-api-key": `creem_123456789` },
          },
      );
  ```
</CodeGroup>

<Tip>
  Read more about all attributes you can pass to a checkout sesssion [here](/learn/checkout-session/introduction)
</Tip>

## 3. Redirect user to checkout url

Once you have created a checkout session, you will receive a checkout URL in the response.

Redirect the user to this URL and that is it! You have successfully created a checkout session and received your first payment!

<AccordionGroup>
  <Accordion icon="table-tree" title="Track payments with a request ID">
    When creating a checkout-session, you can optionally add a `request_id` parameter to track the payment.
    This parameter will be sent back to you in the response and in the webhook events.
    Use this parameter to track the payment or user in your system.
  </Accordion>

  <Accordion icon="location-crosshairs" title="Set a success URL on the checkout session">
    After successfully completing the payment, the user will be automatically redirected to the URL you have set on the product creation.
    You can bypass this setting by setting a success URL on the checkout session request by adding the `success_url` parameter.
    The user will always be redirected with the following query parameters:

    * `session_id`: The ID of the checkout session
    * `product_id`: The ID of the product
    * `status`: The status of the payment
    * `request_id`: The request ID of the payment that you optionally have sent
  </Accordion>
</AccordionGroup>

## 4. Receive payment data on your Return URL

A return URL will always contain the following query parameters, and will look like the following:

<Tip>
  `https://yourwebsite.com/your-return-path?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c?`

  You can read more about [Return Urls](/learn/checkout-session/return-url) here.
</Tip>

| Query parameter  | Description                                                                    |
| ---------------- | ------------------------------------------------------------------------------ |
| checkout\_id     | The ID of the checkout session created for this payment.                       |
| order\_id        | The ID of the order created after successful payment.                          |
| customer\_id     | The customer ID, based on the email that executed the successful payment.      |
| subscription\_id | The subscription ID of the product.                                            |
| product\_id      | The product ID that the payment is related to.                                 |
| request\_id      | **Optional** The request ID you provided when creating this checkout session.  |
| signature        | All previous parameters signed by creem using your API-key, verifiable by you. |

<Warning>
  We also encourage reading on how you can verify Creem signature on return URLs [here](/learn/checkout-session/return-url).
</Warning>

### Expanding your integration

You can also use webhooks to check payment data dynamically in your application, without the need to wait for the return URLs, or have the user redirected to your application website.

<CardGroup>
  <Card title="Return URLs" icon="globe-pointer" href="/learn/checkout-session/return-url">
    Understand what you will receive when users complete a payment and get redirected back to your website.
  </Card>

  <Card title="Webhooks and Events" icon="square-code" href="/learn/webhooks/introduction">
    Set up webhooks to receive updates on your application automatically.
  </Card>
</CardGroup>
# Introduction

> Understand general concepts, response codes, and authentication strategies.

## Base URL

The Creem API is built on REST principles. We enforce HTTPS in every request to improve data security, integrity, and privacy. The API does not support HTTP.

All requests contain the following base URL:

```http  theme={null}
https://api.creem.io
```

## Authentication

To authenticate you need to add an `x-api-key` header with the contents of the header being your API Key.
All API endpoints are authenticated using Api Keys and picked up from the specification file.

```json  theme={null}
{
  "headers": {
    "x-api-key": "creem_123456789"
  }
}
```

## Response codes

Creem uses standard HTTP codes to indicate the success or failure of your requests.
In general, 2xx HTTP codes correspond to success, 4xx codes are for user-related failures, and 5xx codes are for infrastructure issues.

| Status | Description                             |
| ------ | --------------------------------------- |
| 200    | Successful request.                     |
| 400    | Check that the parameters were correct. |
| 401    | The API key used was missing.           |
| 403    | The API key used was invalid.           |
| 404    | The resource was not found.             |
| 429    | The rate limit was exceeded.            |
| 500    | Indicates an error with Creem servers.  |

