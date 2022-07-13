import React from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import {
    CircularProgress,
    Container,
    FormControl, FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography
} from "@mui/material";
import { styled } from '@mui/material/styles';
import Search from '@mui/icons-material/Search';
import {ethers} from "ethers";
import axios from "axios";

const instance = axios.create({
    baseURL: 'https://testnets-api.opensea.io/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
})
const API = {
    getAssets: ({ owner }) => instance.get('/assets', { params: {
        owner,
        offset: 0,
        limit: 50
    } })
}

const Body = styled(Container)`
    display: flex;
    justify-content: center;
    height: 100vh;
    margin-top: 20%;
`
const Main = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
`
const Input = styled(OutlinedInput)`
    // width: 731px;
`
const SearchField = styled(FormControl)`
    margin-bottom: 1rem;
    width: 600px;
`
const SearchIconButton = styled(IconButton)`
    &:hover {
        cursor: pointer;
    }
`
const PicsWrap = styled('div')`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    width: 600px;
    grid-gap: 0.5rem;
`
const PicBox = styled('div')`
    position: relative;
    padding-bottom: 100%;
    // border: 1px solid black;
`
const Img = styled('img')`
    height: 100%;
    width: 100%;
    object-fit: cover;
    left: 0;
    position: absolute;
    top: 0;
`

function App() {
  const [addr, setAddr] = React.useState('');
  const [validAddr, setValidAddr] = React.useState(true);
  const [pics, setPics] = React.useState(null);
  const [picsErr, setPicsErr] = React.useState(null);
  const [loading, setLoading] = React.useState(null);
  const handleChange = (e) => {
      const value = e.target.value

      if (value.length !== 0) {
          setAddr(value)
          setValidAddr(ethers.utils.isAddress(value))
      } else {
          setAddr('')
          setValidAddr(true)
          setPics(null)
          setPicsErr(null)
      }
  }
  const handleGetPics = () => {
      setLoading(true)

      API.getAssets({ owner: addr })
          .then(({ data }) => {
              let items = []

              data.assets.forEach(item => {
                  const isNotPicture = /\.(mp3|mp4)$/i.test(item.image_url)

                  if (item.name && item.image_url && !isNotPicture) {
                      items.push(item)
                  }
              })

              setPics(items)
              setPicsErr(null)
          })
          .catch(err => {
              console.log('err: ', err)
              setPicsErr(err.message)
          })
          .finally(() => {
              setLoading(false)
          })
  }
  const keyPress = (e) => {
    if (e.keyCode === 13) {
        handleGetPics()
    }
  }

  return (
      <>
          <CssBaseline />
          <Body>
              <Main>
                  <SearchField fullWidth variant={"outlined"} error={!validAddr}>
                      <InputLabel>Address</InputLabel>
                      <Input
                          id="search"
                          type={'text'}
                          value={addr}
                          onChange={handleChange}
                          onKeyDown={keyPress}
                          endAdornment={
                              <InputAdornment position="end">
                                  <SearchIconButton
                                      aria-label="search-button"
                                      disabled={!validAddr || addr.length === 0}
                                      onClick={handleGetPics}
                                      edge="end"
                                  >
                                      <Search />
                                  </SearchIconButton>
                              </InputAdornment>
                          }
                          label="Password"
                      />
                      {!validAddr && (
                          <FormHelperText error id="search-error">
                              {'Wrong address'}
                          </FormHelperText>
                      )}
                  </SearchField>
                  {pics !== null && (
                      <>
                          {
                              loading ? <CircularProgress /> : (
                                  <>
                                      {pics.length > 1 ? (
                                          <PicsWrap>
                                              {pics.map((pic) => {
                                                  return (
                                                      <PicBox>
                                                          <Img
                                                              src={pic.image_url}
                                                              alt={pic.name}
                                                          />
                                                      </PicBox>
                                                  )
                                              })}
                                          </PicsWrap>
                                      ) : (
                                          <>
                                              <Typography variant={'h2'}>There is nothing!</Typography>
                                          </>
                                      )
                                      }
                                  </>
                              )
                          }
                      </>
                  )}
                  {picsErr && (
                      <Typography variant={'h3'} style={{ color: 'rgb(211, 47, 47)' }}>
                          {picsErr}
                      </Typography>
                  )}
              </Main>
          </Body>
      </>
  );
}

export default App;
