import React, { useState, useEffect } from 'react';
import {
  Frame,
  Navigation,
  Page,
  Layout,
} from "@shopify/polaris";
import { gql, useQuery } from "@apollo/client";
import styled from 'styled-components';

const ProductsWrapper = styled.div`
  display: grid;
  grid: 300px 300px / auto auto auto auto auto;
  grid-gap: 30px;
`

const ProductWrapper = styled.div`
  background: white;
  padding: 1rem;
  max-width: fit-content;
  min-height: fit-content;
  display: flex;
  flex-direction: column;

  img {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .title {
    margin: .5rem 0;
    max-height: 5rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

/* products query schema */
const GET_PRODUCTS = gql`
  query ($numProducts: Int!, $cursor: String, $query: String) {
    products (
        first: $numProducts, 
        after: $cursor, 
        query: $query,
      ) {
      edges {
        cursor
        node {
          title
          productType
          featuredImage {
            altText
            url
          }
          priceRangeV2 {
            maxVariantPrice {
              amount
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

/* product types query schema */
const GET_PRODUCT_TYPES = gql`
  query ($numProducts: Int!) {
    shop {
      productTypes (first: $numProducts) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node
        }
      }
    }
  }
`;

export function HomePage() {
  const [cursor, setCursor] = useState(null);
  const [numProducts, setNumProducts] = useState(50);

  /* Product Types Query */
  const { data: productTypesData, loading: productTypesLoading, } = useQuery(GET_PRODUCT_TYPES, { 
    variables: { 
      numProducts 
    } 
  });

  /* Products Query */
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      cursor,
      numProducts,
      query: 'productType:null'
    }
  });

  
  let categoriesNav = [];

  /* populate categories nav after fetching product types */
  if (productTypesData) {
    const productTypes = productTypesData?.shop?.productTypes?.edges?.map((prType) => prType?.node);

    /* map product types array to return sidebar option */
    categoriesNav = productTypes.map((cat) => {
      return { 
        label: cat,
        onClick: () => {
          refetch({
            query: `productType:${cat}`
          })
        }
      } 
    });
  }
 
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section secondary>
          <Frame>
            <Navigation location="/">
              <Navigation.Section
                items={[
                  {
                    label: 'All Products',
                    onClick: () => {
                      refetch({
                        query: `productType:null`
                      });
                    }
                  },
                  ...categoriesNav /* concat categories nav to sidebar */
                ]}
              />
            </Navigation>
          </Frame>
        </Layout.Section>
        <Layout.Section>
          <ProductsWrapper>
            {
              data?.products?.edges?.map((pr) => (
                <ProductWrapper key={pr?.cursor}>
                  <img 
                    alt={pr?.node?.featuredImage?.altText}
                    src={pr?.node?.featuredImage?.url || 'https://dummyimage.com/200x200/666666/ffffff&text=Dummy+Image'}
                  />
                  <p className='title'>{pr?.node?.title}</p>
                  <p className='price'>${pr?.node?.priceRangeV2?.maxVariantPrice?.amount}</p>
                </ProductWrapper>
              ))
            }
          </ProductsWrapper>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
