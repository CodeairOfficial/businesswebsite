import React from 'react'
import Page from 'components/common/layouts/page'
import { PageHero } from 'components/common/page-hero'
import themes from './themes.module.scss'
import { pageHOC } from 'context/pageHOC'
import { usePageContext } from 'context/page-context'
import { Tags } from 'components/common/tags'
import { getGlobalData } from 'services/global'
import { GetContentSections, GetPage } from 'services/page'
import { useTranslations } from 'next-intl'
import { Snapshot } from 'components/common/snapshot'
import css from './raffle-auction.module.scss'
import AuctionIcon from 'assets/icons/auction.svg'
import CalendarIcon from 'assets/icons/calendar.svg'
import { Button } from 'components/common/button'

export default pageHOC(function RaffleAuction(props: any) {
  const intl = useTranslations()
  const pageContext = usePageContext()

  return (
    <Page theme={themes['tickets']}>
      <PageHero
        path={[{ text: <span className="bold">{intl('navigation_tickets')}</span> }, { text: props.page.title }]}
        navigation={[
          {
            title: intl('tickets_raffle_about'),
            to: '#about',
          },
          {
            title: intl('tickets_raffle_auction'),
            to: '#auction',
          },
          {
            title: intl('tickets_raffle_title'),
            to: '#raffle',
          },
          {
            title: intl('tickets_raffle_withdrawal'),
            to: '#withdrawal',
          },
          {
            title: intl('tickets_raffle_poap'),
            to: '#poap',
          },
          {
            title: intl('tickets_raffle_reasoning'),
            to: '#why',
          },
        ]}
      />

      <div className="section">
        <div className={`${css['about']} clear-bottom border-bottom`} id="about">
          <div className={`${css['left']} section-markdown`}>
            <h2>{intl('tickets_raffle_subtitle')}</h2>
            <div className="markdown" dangerouslySetInnerHTML={{ __html: props.page.body }} />
          </div>

          <div className={css['right']}>
            <h2 className="spaced">{intl('tickets_raffle_important_dates')}</h2>
            <Snapshot
              items={[
                {
                  Icon: AuctionIcon,
                  title: intl('tickets_raffle_auction_begins'),
                  right: 'TBA',
                },
                {
                  Icon: CalendarIcon,
                  title: intl('tickets_raffle_ticket_sale_waves'),
                  right: intl('tickets_raffle_july_18'),
                },
              ]}
            />

            <Button className="blue lg disabled">{intl('tickets_raffle_coming_soon')}</Button>
          </div>
        </div>

        {props.sections['how-will-the-auction-work'] && (
          <div
            className={`section-markdown markdown clear-bottom`}
            dangerouslySetInnerHTML={{ __html: props.sections['how-will-the-auction-work'].body }}
          />
        )}
      </div>

      <div className="section">
        <Tags items={pageContext?.current?.tags} viewOnly />
      </div>
    </Page>
  )
})

export async function getStaticProps(context: any) {
  const globalData = await getGlobalData(context)
  const page = await GetPage('/raffle-auction', context.locale)
  const sections = await GetContentSections(['how-will-the-auction-work'], context.locale)

  return {
    props: {
      ...globalData,
      page,
      sections,
    },
  }
}