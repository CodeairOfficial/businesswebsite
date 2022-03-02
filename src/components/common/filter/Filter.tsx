import React from 'react'
import css from './filter.module.scss'
import { Dropdown } from 'components/common/dropdown'
import IconCheck from 'assets/icons/check_circle.svg'
import IconPlus from 'assets/icons/plus.svg'
import IconClose from 'assets/icons/cross.svg'
import IconFilter from 'assets/icons/filter.svg'
import { Button } from 'components/common/button'

export type FilterOptions = {
  tags?: boolean
  multiSelect?: boolean
  initialFilter?: any
  filters: {
    text: string
    value: any
  }[]
  filterFunction: (currentFilter?: string) => any[]
}

type FilterState = {
  collapsed?: boolean
  neverCollapse?: boolean
  tags?: boolean
  options: FilterOptions
  activeFilter: string
  setActiveFilter: (value: string) => void
  clearFilter: () => void
}

export const useFilter = (options: FilterOptions | undefined) => {
  const defaultValue = options?.filters[0]?.value ?? ''
  const [activeFilter, setActiveFilter] = React.useState(options?.initialFilter || defaultValue)
  // Some filters use multiselect
  const [activeFilterMulti, setActiveFilterMulti] = React.useState(
    (options?.initialFilter || {}) as { [key: string]: any }
  )

  if (!options) return [[], null] as [any[], null]

  const wrappedSetActiveFilter = (value: string | any, setExact?: false) => {
    if (options.multiSelect) {
      if (setExact) return setActiveFilterMulti(value)

      const nextActiveFilter = {
        ...activeFilterMulti,
        [value]: true,
      } as { [key: string]: any }

      const selected = activeFilterMulti[value]

      if (selected) delete nextActiveFilter[value]

      setActiveFilterMulti(nextActiveFilter)
    } else {
      setActiveFilter(value)
    }
  }

  const filterState: FilterState = {
    options,
    activeFilter: options.multiSelect ? activeFilterMulti : activeFilter,
    clearFilter: () => {
      if (options.multiSelect) {
        setActiveFilterMulti({})
      } else {
        setActiveFilter(defaultValue)
      }
    },
    setActiveFilter: wrappedSetActiveFilter,
  }

  const filteredData = options.filterFunction(filterState.activeFilter)

  return [filteredData, filterState] as [any[], FilterState]
}

type FilterFoldoutProps = {
  children: (open: boolean, setOpen: (isOpen: boolean) => void) => React.ReactElement
}

export const FilterFoldout = (props: FilterFoldoutProps) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.createRef<HTMLDivElement | any>()
  const buttonRef = React.createRef<HTMLDivElement | any>()

  React.useEffect(() => {
    const handleClickOutside = (e: any) => {
      const isButtonClick = buttonRef.current && buttonRef.current.contains(e.target)

      if (!isButtonClick && ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [ref, buttonRef, open])

  let className = css['filter-foldout']

  if (open) className += ` ${css['open']}`

  return (
    <div className={`${className}`}>
      <button
        ref={buttonRef}
        className={`${open ? 'app hover' : 'app'} squared sm thin-borders`}
        onClick={(e: any) => {
          setOpen(!open)
        }}
      >
        {open ? <IconClose /> : <IconFilter />}
      </button>

      <div className={css['foldout']}>
        <div className={css['content']} ref={ref}>
          <p className={css['header']}>Filter</p>
          {props.children(open, setOpen)}
        </div>
      </div>
    </div>
  )
}

export const Filter = (props: FilterState) => {
  if (props.options.tags) {
    return (
      <div className={css['tags']} data-type="filter">
        {props.options.filters.map(filter => {
          let className = `${css['tag']} label label-hover white plain`

          const active = props.activeFilter === filter.value || props.activeFilter?.[filter.value]

          if (active) className += ` ${css['active']} black`

          return (
            <button key={filter.value} onClick={() => props.setActiveFilter(filter.value)} className={className}>
              <div className={css['icons']}>
                <IconCheck className={`icon ${css['icon-check']}`} />
                <IconPlus className={`icon ${css['icon-plus']}`} />
              </div>
              <span>{filter.text}</span>
            </button>
          )
        })}
      </div>
    )
  }

  let className = css['filter']

  if (props.collapsed) className += ` ${css['collapsed']}`
  if (props.options.multiSelect) className += ` ${css['never-collapse']}`

  return (
    <div className={className} data-type="filter">
      {/* <Dropdown
        className={css['dropdown']}
        customIcon={IconFilter}
        options={props.options.filters}
        value={props.activeFilter}
        onChange={nextValue => props.setActiveFilter(nextValue)}
      /> */}

      <div className={css['inline']}>
        {props.options.filters.map(filter => {
          let className = ''

          const active = props.activeFilter === filter.value || props.activeFilter?.[filter.value]

          if (active) className += `${css['active-filter']}`

          return (
            <p key={filter.value} onClick={() => props.setActiveFilter(filter.value)} className={className}>
              {filter.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}
