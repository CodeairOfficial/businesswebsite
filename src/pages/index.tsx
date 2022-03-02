import Default from 'components/common/layouts/default'
import { PWAPrompt } from 'components/domain/app/pwa-prompt'
import { BlogReel } from 'components/domain/blog-overview'
import { News } from 'components/domain/news'
import { SEO } from 'components/domain/seo'
import { pageHOC } from 'context/pageHOC'
import { GetBlogs } from 'services/blogs'
import { GetNavigationData } from 'services/navigation'
import { GetLatestNotification } from 'services/notifications'
import { Notifications } from 'components/domain/app/notifications'
import { TITLE } from 'utils/constants'
import { GetPages, GetNews } from 'services/page'
import { GetStaticPaths } from 'next'
import { getMessages } from 'utils/intl'

export default pageHOC(function Index(props: any) {
  return (
    <Default>
      <SEO />
      {/* <PWAPrompt /> */}
      {/* <News data={props.newsItems} /> */}
      <BlogReel blogs={props.blogs} />
      {/* <Notifications /> */}
    </Default>
  )
})

export async function getStaticProps(context: any) {
  // Get News
  const intl = await getMessages(context.locale)

  return {
    props: {
      messages: intl,
      blogs: await GetBlogs(),
      navigationData: await GetNavigationData(context.locale),
      notification: GetLatestNotification(context.locale),
      news: GetNews(context.locale),
      page: {
        title: TITLE,
        description: intl.description,
        template: 'index',
        tags: [],
        lang: context.locale,
        id: 'index',
        slug: 'index',
      },
    },
  }
}
