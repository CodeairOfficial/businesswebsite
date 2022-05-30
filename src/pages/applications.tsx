import React from 'react'
import Page from 'components/common/layouts/page'
import { PageHero } from 'components/common/page-hero'
import themes from './themes.module.scss'
import { pageHOC } from 'context/pageHOC'
import { usePageContext } from 'context/page-context'
import { Tags } from 'components/common/tags'
import { getGlobalData } from 'services/global'
import { GetPage } from 'services/page'
import css from './applications.module.scss'
import { useTranslations } from 'next-intl'
import { Link } from 'components/common/link'
import List from 'components/common/list'
import { Button } from 'components/common/button'
import { Snapshot } from 'components/common/snapshot'
import PencilIcon from 'assets/icons/pencil.svg'
import CalendarIcon from 'assets/icons/calendar.svg'
import SelectionIcon from 'assets/icons/selection.svg'
import Image from 'next/image'
import SwipeToScroll from 'components/common/swipe-to-scroll'
import Process1 from 'assets/images/application-process-1.png'
import Process2 from 'assets/images/application-process-2.png'
import Process3 from 'assets/images/application-process-3.png'

const ProcessOverview = () => {
  return (
    <SwipeToScroll>
      <div className={css['cards']}>
        <div className={css['card']}>
          <Image src={Process1} objectFit="cover" layout="fill" />
        </div>
        <div className={css['card']}>
          <Image src={Process2} objectFit="cover" layout="fill" />
        </div>
        <div className={css['card']}>
          <Image src={Process3} objectFit="cover" layout="fill" />
        </div>
        <div className={css['card']}>
          <Image src={Process1} objectFit="cover" layout="fill" />
        </div>
      </div>
    </SwipeToScroll>
  )
}

export default pageHOC(function Applications(props: any) {
  const intl = useTranslations()
  const pageContext = usePageContext()

  return (
    <Page theme={themes['schedule']}>
      <PageHero
        path={[{ text: <span className="bold">Program</span> }, { text: 'Applications' }]}
        navigation={[
          {
            title: intl('program_application_process'),
            to: '#process',
          },
          {
            title: intl('program_application_guidelines'),
            to: '#guidelines',
          },
        ]}
      />

      <div className={css['layout']}>
        <div className="section">
          <div className={`${css['about']} clear-bottom border-bottom`} id="about">
            <div className={css['left']}>
              <div>
                <h2>Speaker Applications</h2>
                <p className="h2 highlighted">
                  Learn how to apply to speak or give a workshop, when you can expect to hear back on your application,
                  how the selection process works, and other ways to contribute to Devcon VI.
                </p>
              </div>

              <div className={css['links']}>
                <Link to="/" className="bold text-uppercase">
                  <Button className="purple lg">Apply to Speak</Button>
                </Link>
              </div>
            </div>

            <div className={css['right']}>
              <h2 className="spaced">Important Dates</h2>
              <Snapshot
                items={[
                  {
                    Icon: PencilIcon,
                    title: 'APPLICATIONS OPEN',
                    right: 'June 1',
                  },
                  {
                    Icon: CalendarIcon,
                    title: 'DEADLINE TO APPLY',
                    right: 'June 30',
                  },
                  {
                    Icon: SelectionIcon,
                    title: 'SELECTION DECISION',
                    right: (
                      <span>
                        <span className="font-xs">Before</span>
                        <span className="bold">July 30</span>
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div className={`${css['guidelines']} clear-bottom `} id="process">
            <h2 className="spaced clear-top">Process Overview</h2>

            <ProcessOverview />
          </div>

          <div className={`${css['guidelines']} clear-bottom clear-top border-top`} id="guidelines">
            <h2 className="spaced">Application Guidelines</h2>

            <List
              withSeparators
              items={[
                {
                  id: 'collab',
                  title: 'Who can apply?',
                  indent: false,
                  body: 'Everyone! Applications are open to the public and we encourage you to submit an application if you would like to contribute. ',
                },
                {
                  id: 'teaching',
                  title: 'How do I apply?',
                  body: 'Head to speak.devcon.org and submit your application.',
                },
                {
                  id: 'updating-community',
                  title: 'What types of session can I apply to give?',
                  body: (
                    <div>
                      <ul>
                        <li>1</li>
                        <li>2</li>
                        <li>3</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  id: 'bridging',
                  title: 'Building bridges with other communities',
                  body: 'There are many communities adjacent to Ethereum that are value-aligned - Devcon is a chance to come together.',
                },
                {
                  id: 'community-heard',
                  title: 'Ensuring our community is heard',
                  body: 'Devcon is a conference for the Ethereum community, and is an opportunity for the community to share important updates.',
                },
              ]}
            />
          </div>
          <div className="clear-bottom">
            <h2 className="spaced">Additional Questions?</h2>

            <p>Head to the FAQ page [link] and if you have further questions reach out to [insert programming alias]</p>
          </div>
        </div>

        <div className="section">
          <Tags items={pageContext?.current?.tags} viewOnly={false} />
        </div>
      </div>
    </Page>
  )
})

export async function getStaticProps(context: any) {
  const globalData = await getGlobalData(context)
  const page = await GetPage('/speaker-applications', context.locale)

  return {
    props: {
      ...globalData,
      page,
    },
  }
}
