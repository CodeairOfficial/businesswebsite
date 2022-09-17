import React, { useEffect, useRef } from 'react'
import css from './schedule.module.scss'
import { AppNav } from 'components/domain/app/navigation'
import { Search, Tags, Basic, FilterFoldout } from 'components/common/filter/Filter'
import { NoResults } from 'components/common/filter'
import Star from 'assets/icons/star.svg'
import StarFill from 'assets/icons/star-fill.svg'
import TileIcon from 'assets/icons/tiles.svg'
import ShareIcon from 'assets/icons/share.svg'
import ListIcon from 'assets/icons/list-simple.svg'
import { List } from './views/List'
import { Session } from 'types/Session'
import { useRouter } from 'next/router'
import moment, { Moment } from 'moment'
import SwipeToScroll from 'components/common/swipe-to-scroll'
// import FuzzySearch from 'fuzzy-search'
import { useAccountContext } from 'context/account-context'
import filterCss from 'components/domain/app/app-filter.module.scss'
import { useAppContext } from 'context/app-context'
import { Room } from 'types/Room'

type Timeslot = {
  time: number
  sessions: Session[]
}

export type Date = {
  readable: string
  moment?: Moment
}

export type ScheduleInformation = {
  sessionTimeslots: {
    [key: number]: Session[]
  }
  sessionsByTime: {
    date: Date
    timeslots: Timeslot[]
  }[]
  timeslotOrder: number[]
}

export const normalizeDate = (moment: Moment) => {
  return moment.format('MMM Do')
}

const useFormatSessions = (sessions: Session[]) => {
  return React.useMemo(() => {
    return sessions.map(session => {
      const startTimeAsMoment = moment.utc(session.start)
      const endTimeAsMoment = startTimeAsMoment.clone().add(session.duration, 'minutes')

      return {
        ...session,
        startTimeAsMoment,
        endTimeAsMoment,
        day: startTimeAsMoment.format('dddd, MMM Do'),
        date: normalizeDate(startTimeAsMoment),
      }
    })
  }, [sessions])
}

const getSessionsByDatesAndTimeslots = (sessions: Session[], dates: Date[]) => {
  const sessionTimeslots = {} as ScheduleInformation['sessionTimeslots']
  const timeslotOrder = [] as ScheduleInformation['timeslotOrder']

  sessions.forEach(session => {
    if (!sessionTimeslots[session.start]) {
      timeslotOrder.push(session.start)
      sessionTimeslots[session.start] = []
    }

    sessionTimeslots[session.start].push(session)
  })

  const sessionsByTime = dates.map((date: Date) => {
    return {
      date,
      timeslots: timeslotOrder.sort().reduce((acc, time) => {
        const startTime = moment.utc(time)

        if (startTime.isSame(date.moment, 'day')) {
          const sessionsInTimeslot = sessionTimeslots[time]

          acc.push({ time, sessions: sessionsInTimeslot })
        }

        return acc
      }, [] as Timeslot[]),
    }
  })

  return { sessionsByTime, sessionTimeslots, timeslotOrder, dates }
}

export const multiSelectFilter = (selectedFilter: { [key: string]: boolean }, key?: string) => {
  const filter = Object.keys(selectedFilter)
  const filterIsActive = filter.length > 0

  if (filterIsActive) {
    if (!key) return false
    if (!selectedFilter[key]) return false
  }

  return true
}

export const Schedule = (props: any) => {
  const { sessions: sessionsBeforeFormatting, tracks, event } = props
  const personalAgenda = !!props.userId
  const { account } = useAccountContext()
  const router = useRouter()
  const { now } = useAppContext()
  const [search, setSearch] = React.useState('')
  const [view, setView] = React.useState('list')
  const [basicFilter, setBasicFilter] = React.useState(personalAgenda ? 'personal' : 'all')
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [selectedTracks, setSelectedTracks] = React.useState({} as { [key: string]: boolean })
  const [selectedRooms, setSelectedRooms] = React.useState({} as { [key: string]: boolean })
  const [selectedSessionTypes, setSelectedSessionTypes] = React.useState({} as { [key: string]: boolean })
  const [selectedExpertise, setSelectedExpertise] = React.useState({} as { [key: string]: boolean })
  const [dateFilter, setDateFilter] = React.useState<{ readable: string; moment?: Moment | null }>({ readable: 'all' })
  const listRef = useRef<any>()

  const eventDates = React.useMemo(() => {
    const dates = []
    const end = moment.utc(event.date_to).add(1, 'days')

    let current = moment.utc(event.date_from)

    while (!current.isSame(end)) {
      const next = current.clone()
      dates.push({ readable: normalizeDate(next), moment: next })
      current.add(1, 'days')
    }

    return dates
  }, [event])

  // When selecting a specific day, open it immediately
  // When selecting all days, close them to provide a hollistic view of the events
  useEffect(() => {
    if (listRef.current) {
      if (dateFilter.readable !== 'all') {
        listRef.current.openAll()
      } else if (dateFilter.readable) {
        listRef.current.closeAll()
      }
    }
  }, [dateFilter])

  // Open all days when searching
  useEffect(() => {
    if (listRef.current) {
      if (search.length > 0) {
        listRef.current.openAll()
      }
    }
  }, [search])

  const bookmarkedSessions = account?.appState?.sessions

  // Format sessions (memoized)
  const formattedSessions = useFormatSessions(sessionsBeforeFormatting)
  // Create search index
  // const searcher = React.useMemo(
  //   () => new FuzzySearch(formattedSessions, ['title', 'speakers.name', 'description', 'room.name']),
  //   [formattedSessions]
  // )
  // Apply search filter
  // const sessionsMatchingSearch = search.length > 0 ? searcher.search(search) : formattedSessions
  // Apply remaining filters
  const filteredSessions = formattedSessions.filter((session: Session) => {
    // Filter by search
    if (search) {
      let matchesAnySearch
      const lowerCaseSearch = search.toLowerCase()

      if (session.room && session.room.name.toLowerCase().includes(lowerCaseSearch)) matchesAnySearch = true
      if (session.title.toLowerCase().includes(lowerCaseSearch)) matchesAnySearch = true
      if (session.speakers.some(speaker => speaker.name.toLowerCase().includes(lowerCaseSearch)))
        matchesAnySearch = true
      if (session.description && session.description.toLowerCase().includes(lowerCaseSearch)) matchesAnySearch = true

      if (!matchesAnySearch) return false
    }

    // Filter by interested
    if (favoritesOnly) {
      const bookmarkedSession = bookmarkedSessions?.find(bookmark => bookmark.id === session.id)

      if (bookmarkedSession?.level !== 'interested') return false
    }

    // Filter by attending/past/upcoming
    if (basicFilter === 'attending') {
      const bookmarkedSession = bookmarkedSessions?.find(bookmark => bookmark.id === session.id)

      if (bookmarkedSession?.level !== 'attending') return false
    } else if (basicFilter === 'past') {
      const sessionHasHappened = now && now.isAfter(session.endTimeAsMoment)

      if (!sessionHasHappened) return false
    } else if (basicFilter === 'upcoming') {
      const sessionIsUpcoming = now && now.isBefore(session.startTimeAsMoment)

      if (!sessionIsUpcoming) return false
    }

    // Filter by tracks
    const trackMatches = multiSelectFilter(selectedTracks, session.track)
    const roomMatches = multiSelectFilter(selectedRooms, session.room?.name)
    const difficultyMatches = multiSelectFilter(selectedExpertise, session.expertise)
    const typeMatches = multiSelectFilter(selectedSessionTypes, session.type)

    if (!trackMatches) return false
    if (!roomMatches) return false
    if (!difficultyMatches) return false
    if (!typeMatches) return false

    // Filter by day
    if (dateFilter.readable !== 'all') {
      const sessionIsSameDay = session.date === dateFilter.readable

      if (!sessionIsSameDay) return false
    }

    if (dateFilter.readable === 'Invalid date') {
      return false
    }

    return true
  })

  const { sessionTimeslots, timeslotOrder, sessionsByTime } = getSessionsByDatesAndTimeslots(
    filteredSessions,
    eventDates
  )

  const noResults = filteredSessions.length === 0

  return (
    <>
      <AppNav
        nested
        links={[
          {
            title: 'Agenda',
            to: '/app/schedule',
          },
        ]}
        renderRight={() => {
          if (!account) return null

          const starProps = {
            onClick: () => setFavoritesOnly(!favoritesOnly),
            style: {
              cursor: 'pointer',
            },
          }

          return (
            <>
              {account && (
                <ShareIcon
                  onClick={() => {
                    router.push('/app/settings#schedule')
                  }}
                />
              )}
              {favoritesOnly ? <StarFill {...starProps} className="icon fill-red" /> : <Star {...starProps} />}
            </>
          )
        }}
      />

      <div className="section">
        <Basic
          value={basicFilter}
          onChange={setBasicFilter}
          options={
            personalAgenda
              ? [
                  {
                    text: 'Personal Agenda',
                    value: 'personal',
                  },
                ]
              : [
                  {
                    text: 'All',
                    value: 'all',
                  },
                  {
                    text: 'Attending',
                    value: 'attending',
                  },
                  {
                    text: 'Past',
                    value: 'past',
                  },
                  {
                    text: 'Upcoming',
                    value: 'upcoming',
                  },
                ]
          }
        />
        {personalAgenda && <p>This is a personalized schedule.</p>}
      </div>

      {!personalAgenda && (
        <div className={filterCss['filter']}>
          <div className="section">
            <Search placeholder="Find a session" value={search} onChange={setSearch} timeout={300} />

            <div className={filterCss['foldout']}>
              <FilterFoldout
                active={
                  Math.max(
                    Object.keys(selectedTracks).length,
                    Object.keys(selectedRooms).length,
                    Object.keys(selectedExpertise).length,
                    Object.keys(selectedSessionTypes).length
                  ) > 0
                }
              >
                {(open, setOpen) => {
                  return (
                    <div className={filterCss['foldout-content']}>
                      <div className={filterCss['filter-section']}>
                        <p className="app-header clear-bottom-less">Tracks</p>
                        <Tags
                          value={selectedTracks}
                          onChange={nextValue => {
                            const isAlreadySelected = selectedTracks[nextValue]

                            const nextState = {
                              ...selectedTracks,
                            }

                            if (isAlreadySelected) {
                              delete nextState[nextValue]
                            } else {
                              nextState[nextValue] = true
                            }

                            setSelectedTracks(nextState)
                          }}
                          options={tracks
                            .filter((track: string) => !!track)
                            .map((i: string) => {
                              return {
                                text: i,
                                value: i,
                              }
                            })}
                        />
                      </div>

                      <div className={filterCss['filter-section']}>
                        <p className="app-header clear-bottom-less">Expertise</p>
                        <Tags
                          value={selectedExpertise}
                          onChange={nextValue => {
                            const isAlreadySelected = selectedExpertise[nextValue]

                            const nextState = {
                              ...selectedExpertise,
                            }

                            if (isAlreadySelected) {
                              delete nextState[nextValue]
                            } else {
                              nextState[nextValue] = true
                            }

                            setSelectedExpertise(nextState)
                          }}
                          options={props.expertiseLevels.map((i: string) => {
                            return {
                              text: i,
                              value: i,
                            }
                          })}
                        />
                      </div>

                      <div className={filterCss['filter-section']}>
                        <p className="app-header clear-bottom-less">Session Type</p>
                        <Tags
                          value={selectedSessionTypes}
                          onChange={nextValue => {
                            const isAlreadySelected = selectedSessionTypes[nextValue]

                            const nextState = {
                              ...selectedSessionTypes,
                            }

                            if (isAlreadySelected) {
                              delete nextState[nextValue]
                            } else {
                              nextState[nextValue] = true
                            }

                            setSelectedSessionTypes(nextState)
                          }}
                          options={props.sessionTypes.map((i: string) => {
                            return {
                              text: i,
                              value: i,
                            }
                          })}
                        />
                      </div>

                      <div className={filterCss['filter-section']}>
                        <p className="app-header clear-bottom-less">Room</p>
                        <Tags
                          value={selectedRooms}
                          onChange={nextValue => {
                            const isAlreadySelected = selectedRooms[nextValue]

                            const nextState = {
                              ...selectedRooms,
                            }

                            if (isAlreadySelected) {
                              delete nextState[nextValue]
                            } else {
                              nextState[nextValue] = true
                            }

                            setSelectedRooms(nextState)
                          }}
                          options={props.rooms.map((i: Room) => {
                            return {
                              text: i.name,
                              value: i.name,
                            }
                          })}
                        />
                      </div>

                      <div className={filterCss['actions']}>
                        <button
                          className={`app hover sm thin-borders`}
                          onClick={() => {
                            setSelectedTracks({})
                            setSelectedRooms({})
                            setSelectedSessionTypes({})
                            setSelectedExpertise({})
                          }}
                        >
                          Reset Filter
                        </button>

                        <button className={`app hover sm thin-borders`} onClick={() => setOpen(false)}>
                          Confirm
                        </button>
                      </div>
                    </div>
                  )
                }}
              </FilterFoldout>

              <div className={filterCss['right']}>
                <div>
                  <p className="font-xs-fixed">Current Filter:</p>
                  <p className={filterCss['filter-indicator']}>
                    {(() => {
                      const computeFilterShorthand = (filter: { [key: string]: boolean }, key: string) => {
                        const filterAsKeys = Object.keys(filter)

                        if (filterAsKeys.length === 0) return
                        if (filterAsKeys.length === 1) return filterAsKeys[0]

                        return `${key} (${filterAsKeys.length})`
                      }

                      return (
                        [
                          computeFilterShorthand(selectedTracks, 'Track'),
                          computeFilterShorthand(selectedSessionTypes, 'Session Type'),
                          computeFilterShorthand(selectedExpertise, 'Expertise'),
                          computeFilterShorthand(selectedRooms, 'Room'),
                        ]
                          .filter(val => !!val)
                          .join(', ') || 'No filter applied'
                      )
                    })()}
                  </p>
                </div>
                <div className={filterCss['end']}>
                  <button
                    onClick={() => setView('list')}
                    className={`${view === 'list' ? 'hover' : ''} app squared sm thin-borders`}
                  >
                    <ListIcon />
                  </button>
                  <button
                    onClick={() => setView('timeline')}
                    className={`${view === 'timeline' ? 'hover' : ''} app squared sm thin-borders`}
                  >
                    <TileIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className={css['date-selector-container']}>
              <SwipeToScroll scrollIndicatorDirections={{ right: true }}>
                <ul className={css['date-selector']}>
                  {[
                    { text: 'All', value: { readable: 'all', moment: null } },
                    ...eventDates.map(date => {
                      return {
                        text: date.readable,
                        value: date,
                        moment: date.moment,
                      }
                    }),
                  ].map(filter => {
                    let className = ''

                    const selected = dateFilter.readable === filter.value.readable
                    const isCurrentDay = filter.value.moment && filter.value.moment.isSame(now, 'day')

                    if (selected) className += css['selected']
                    if (isCurrentDay) className += ` ${css['is-current-day']}`

                    // TODO: clear up this stuff
                    if (filter.value.readable === 'Invalid date') return null

                    return (
                      <li className={className} key={filter.value.readable} onClick={() => setDateFilter(filter.value)}>
                        {filter.text}
                      </li>
                    )
                  })}
                </ul>
              </SwipeToScroll>
            </div>
          </div>
        </div>
      )}

      <div className="section" style={{ position: 'relative' }}>
        {(() => {
          if (noResults) return <NoResults />

          return view === 'list' ? (
            <List
              now={now}
              sessionTimeslots={sessionTimeslots}
              timeslotOrder={timeslotOrder}
              sessionsByTime={sessionsByTime}
              ref={listRef}
            />
          ) : (
            <p>Timeline view goes here</p>
          )
        })()}
      </div>
    </>
  )
}
