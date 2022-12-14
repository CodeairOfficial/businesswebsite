import React from 'react'
import { SEO } from 'components/domain/seo'
import Content from 'components/common/layouts/page'
import { DIP } from 'components/domain/dips/dip'
import themes from 'pages/themes.module.scss'
import { pageHOC } from 'context/pageHOC'
import { getGlobalData } from 'services/global'
import { GetDIPs } from 'services/dips'

export default pageHOC(function DIPTemplate(props: any) {
  return (
    <Content theme={themes['teal']}>
      <SEO title={props.dip.title} />

      <DIP dip={props.dip} />
    </Content>
  )
})

export async function getStaticPaths(context: any) {
  const dips = await GetDIPs()

  return {
    paths: context.locales
      .filter((locale: string) => locale !== 'default')
      .map((locale: string) => {
        return dips.map(i => {
          return { params: { slug: i.slug }, locale }
        })
      })
      .flat(),
    fallback: false,
  }
}

export async function getStaticProps(context: any) {
  const dips = await GetDIPs()
  const dip = dips.find(i => i.slug.toLowerCase() === context.params.slug.toLowerCase())

  if (!dip) {
    return {
      props: null,
      notFound: true,
    }
  }

  const globalData = await getGlobalData(context)

  return {
    props: {
      ...globalData,
      page: {
        lang: context.locale,
        id: dip.slug,
        slug: dip.slug,
        title: dip.title,
        description: dip.summary,
      },
      dip,
    },
    revalidate: 3600,
  }
}
