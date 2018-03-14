import { h, Component } from 'preact'
import { Link } from 'preact-router/match'
import uniqBy from 'lodash.uniqby'
import sizeMe from 'react-sizeme'
import styled from 'styled-components'
import Confetti from 'react-confetti'
import capitalize from 'capitalize'
import is from 'styled-is'
import removeAccents from 'remove-accents'
import algoliasearch from 'algoliasearch'
import { Pulsate } from 'styled-loaders'

const Title = styled.h1`
  color: ${props => props.theme.secondary};
  font-size: 80px;
`

const Subtitle = styled.h2`
  color: ${props => props.theme.secondary};
  font-size: 40px;
`

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;

  p:not(:last-child) {
    padding-right: 20px;
  }

  ${is('row')`
		flex-direction: row;
	`};
`

const Company = styled.p`
  color: ${props => props.theme.secondary};
  font-size: 24px;
  padding: 0;
  margin: 0;
`

const GoBack = styled(Link)`
  color: ${props => props.theme.secondary};
  z-index: 99;
  width: 100%;
  text-align: center;
  font-size: 24px;
  text-decoration: none;
  position: absolute;
  bottom: 20px;
`

const fixName = name =>
  name
    .split('-')
    .join(' ')
    .toLowerCase()

const fixCity = name => removeAccents(name)

class City extends Component {
  state = {
    cities: [],
    diff: null,
    loaded: false,
  }

  search = city => {
    const client = algoliasearch(
      '3OO1FYFEBH',
      'c6bc7348d7d5c62908beb5e8827248ed'
    )
    const index = client.initIndex('cities')

    if (city.length > 3) {
      index.search({ query: fixName(city) }, (err, content) => {
        if (err) {
          this.setState({
            loaded: true,
          })
          console.error(err)
          return
        }

        this.setState({
          cities: content.hits,
          diff: content.hits.length
            ? !content.hits
                .map(cities => fixCity(cities.name))
                .reduce((a, b) => (a === b ? a : NaN))
            : false,
          loaded: true,
        })
      })
    } else {
      this.setState({
        loaded: true,
      })
    }
  }

  componentDidMount() {
    const { city } = this.props
    this.search(city)
  }

  render({ city, size }, { diff, cities, loaded }) {
    const uber = cities.filter(c => c.company === 'uber')
    const other = cities.filter(c => c.company !== 'uber')

    if (!loaded) {
      return (
        <Flex>
          <Pulsate color="white" />
        </Flex>
      )
    }

    return (
      <Wrapper>
        {loaded ? (
          <Flex>
            {uber.length ? (
              [
                <Wrapper>
                  <Confetti {...size} />
                </Wrapper>,
                <Title>YES 🚗</Title>,
              ]
            ) : (
              <Title>NO 😕</Title>
            )}
            {other.length ? (
              <div>
                {uber.length ? (
                  <Subtitle>There is also</Subtitle>
                ) : (
                  <Subtitle>But there is</Subtitle>
                )}

                <Flex row>
                  {uniqBy(other, 'company').map(c => (
                    <Company>{capitalize(c.company)}</Company>
                  ))}
                </Flex>
              </div>
            ) : null}
            <GoBack href="/">Search Again 🔎</GoBack>
          </Flex>
        ) : null}
      </Wrapper>
    )
  }
}

export default sizeMe({
  monitorHeight: true,
  monitorWidth: true,
})(City)
