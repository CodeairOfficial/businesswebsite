import React from 'react'
import css from './about.module.scss'
import DevconLogo from 'assets/images/devcon-logo-bogota-text.svg'
import { Button } from 'components/common/button'
import Image from 'next/image'
import TriangleWithImages from 'assets/images/about-triangles.png'
import DevconManual from 'assets/images/devcon-manual.png'
import { Link } from 'components/common/link'
import { ContentSection } from 'types/ContentSection'
import SwipeToScroll from 'components/common/swipe-to-scroll'

interface Props {
  content: ContentSection
}

const About = (props: Props) => {
  return (
    <div className={`section ${css['container']}`}>
      <div className={`${css['body']} clear-top`}>
        <div className={css['left']}>
          <DevconLogo />

          <div className={`section-markdown`} dangerouslySetInnerHTML={{ __html: props.content.body }} />

          <p>
            <span className={css['grey']}>
              <span className={css['crossed-out']}>2020</span> / <span className={css['crossed-out']}>2021</span> /
            </span>
            &nbsp;
            <span className="bold">2022</span> 🦄🎉
            <br />
            <span className="bold">Devcon Oct 11-14 📌 Agora Bogotá Convention Center</span>
            <br />
            <span className="font-sm">Devcon Week — October 7-16 in Bogotá, Colombia.</span>
          </p>

          {/* <Link to="/bogota">
            <Button className="red lg">Bogotá City Guide →</Button>
          </Link> */}
        </div>
        <div className={css['right']}>
          <div className={css['image-container']}>
            <Image src={DevconManual} alt="Devcon images" priority />
          </div>
        </div>
        {/* <div className={css['right']}>
          <SwipeToScroll scrollIndicatorDirections={{ left: true }} alwaysShowscrollIndicators>
            <div className={css['image-container']}>
              <Image src={TriangleWithImages} layout="raw" alt="Devcon images" priority />
            </div>
          </SwipeToScroll>
        </div> */}
      </div>
      <div className="clear-bottom margin-bottom border-bottom"></div>
    </div>
  )
}

export default About
