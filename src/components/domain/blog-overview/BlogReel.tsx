import React from 'react'
import { useBlogs } from 'src/hooks/useBlogs'
import moment from 'moment'
import css from './blog-reel.module.scss'
import { Card } from '../../common/card'
import { BlogPost } from 'src/types/BlogPost'
import { Slider, useSlider } from 'src/components/common/slider'

export function BlogReel() {
  const blogs = useBlogs()

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3.1,
    arrows: false,
    slidesToScroll: 3,
    touchThreshold: 100,
    mobileFirst: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.1,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  const sliderProps = useSlider(settings)

  return (
    <div className="section">
      <div className="content">
        <div className={css['cards']}>
          <Slider sliderProps={sliderProps} title="Blog">
            {blogs.map((blog: BlogPost, i: number) => {
              let className = css['card']

              if (i === blogs.length - 1) className += ` ${css['last']}`

              return (
                <Card
                  className={className}
                  key={blog.slug}
                  title={blog.title}
                  imageUrl={blog.imageUrl}
                  expandLink
                  linkUrl={blog.permaLink} // Linking to blog domain temporarily until blog page is done (static-phase)
                  metadata={[moment(blog.date).format('ll'), blog.author]}
                  allowDrag
                />
              )
            })}
          </Slider>
        </div>
      </div>
    </div>
  )
}
