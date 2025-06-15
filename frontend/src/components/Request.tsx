import '@/style.css'

import { ThemeProvider } from '@/components/theme-provider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code, CodeSquare, CodeXml, Eye, EyeOff, File, FileJsonIcon, FileQuestionIcon, FormInput, KeyRound, Plus, TableProperties, Text, TextCursorInput, Trash, Upload } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CodeBlock } from './code-block'
import { useState } from 'react'
import { APIHeaders, Params, RequestBody } from '@/lib/types'
import { METHOD_COLORS } from '@/lib/constants'
import { APIKey } from '@/lib/types'
import Loader from '@/components/Loader'

export default function Request() {
    const [url, setUrl] = useState<string>(localStorage.getItem('url') || '')
    const [method, setMethod] = useState<string>(localStorage.getItem('method') || 'get')
    const [paramsInfo, setParamsInfo] = useState<Params[]>([{ key: '', value: '' }])
    const [body, setBody] = useState<RequestBody[]>([{ key: '', type: 'text', value: '' }])
    const [key, setKey] = useState<APIKey>({ key: '', value: '' })
    const [headers, setHeaders] = useState<APIHeaders[]>([{ name: '', value: '' }])
    const [response, setResponse] = useState<string>('')
    const [bodyType, setBodyType] = useState<string>('form-data')
    const [raw, setRaw] = useState<string>('')
    const [language, setLanguage] = useState<string>('json')
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <main className='flex items-center justify-center flex-col w-full h-full gap-6'>
                <header className='flex items-center justify-center gap-1.5'>
                    <Select defaultValue='get' value={method} onValueChange={e => {
                        setMethod(e)
                        localStorage.setItem('method', e)
                    }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Method" className={METHOD_COLORS[method]} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="get" className='text-green-400'>GET</SelectItem>
                            <SelectItem value="post" className='text-yellow-400'>POST</SelectItem>
                            <SelectItem value="put" className='text-blue-400'>PUT</SelectItem>
                            <SelectItem value="delete" className='text-red-400'>DELETE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input className='w-[340px] md:w-2xl' placeholder='https://api.example.com' value={url} onChange={e => {
                        setUrl(e.target.value)
                        localStorage.setItem('url', e.target.value)
                    }} type='url' />
                    <Button size='icon' className='cursor-pointer' onClick={async () => {
                        if (url.trim() === '') return

                        let requestBody

                        if (bodyType === 'form-data') {
                            requestBody = new FormData()

                            body.forEach(el => {
                                if (el.key !== '') requestBody.append(el.key, el.value)
                            })
                        } else if (bodyType === 'raw') {
                            requestBody = raw
                        }

                        try {

                            setIsLoading(true)

                            const APIresponse = await fetch(url, {
                                method,
                                body: method === 'get' || method === 'head' ? null : requestBody,
                                headers: {
                                    'Authorization': key.value === '' ? '' : `Bearer ${key.value}`,
                                    ...Object.fromEntries(headers.filter(header => header.name !== '').map(header => [header.name, header.value]))
                                }
                            })

                            setIsLoading(false)

                            const contentType = APIresponse.headers.get('Content-Type') || ''

                            if (contentType.startsWith('image/') || contentType.startsWith('audio/') || contentType.startsWith('video/') || contentType === 'application/octet-stream') {
                                const file = await APIresponse.blob()

                                const a = document.createElement('a')
                                a.href = URL.createObjectURL(file)
                                a.download = 'file'
                                a.click()
                                a.remove()
                                setResponse('File successfully downloaded ⬇️')

                                return
                            }

                            setResponse(await APIresponse.text())
                        } catch (err) {
                            setIsLoading(false)
                            console.error('API request error: ', err)
                            setResponse("Error when fetching the API")
                        }
                    }}><ArrowRight /></Button>
                </header>
                <main className='flex flex-col md:w-[810px] w-[490px]'>
                    <Tabs defaultValue='params'>
                        <TabsList>
                            <TabsTrigger className='cursor-pointer' value='params'><FileQuestionIcon /> Params</TabsTrigger>
                            <TabsTrigger className='cursor-pointer' value='body'><Upload /> Body</TabsTrigger>
                            <TabsTrigger className='cursor-pointer' value='auth'><KeyRound /> Auth</TabsTrigger>
                            <TabsTrigger className='cursor-pointer' value='headers'><TableProperties /> Headers</TabsTrigger>
                        </TabsList>
                        <TabsContent value='params'>
                            <Card>
                                <CardContent className='max-h-[250px] overflow-auto'>
                                    <Table>
                                        <TableCaption>The params of the request to the server</TableCaption>
                                        <TableHeader>
                                            <TableRow key={0}>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paramsInfo.map((param, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Input placeholder='key' onChange={e => setParamsInfo(paramsInfo => {
                                                        const newParamsInfo = [...paramsInfo]
                                                        newParamsInfo[i] = { ...newParamsInfo[i], key: e.target.value }

                                                        const formatedParams = newParamsInfo.map(param => (`${param.key}=${param.value}`))

                                                        setUrl(url => `${url.split('?')[0]}?${formatedParams.join('&')}`)

                                                        return newParamsInfo
                                                    })} /></TableCell>
                                                    <TableCell className='flex items-center gap-2'>
                                                        <Input placeholder='value' onChange={e => setParamsInfo(paramsInfo => {
                                                            const newParamsInfo = [...paramsInfo]
                                                            newParamsInfo[i] = { ...newParamsInfo[i], value: e.target.value }

                                                            const formatedParams = newParamsInfo.map(param => (`${param.key}=${param.value}`))

                                                            setUrl(url => `${url.split('?')[0]}?${formatedParams.join('&')}`)

                                                            return newParamsInfo
                                                        })} />
                                                        {i !== 0 ? (<Button size='icon' variant='destructive' onClick={() => {
                                                            setParamsInfo(prev => {
                                                                const filteredParams = prev.filter((_, idx) => idx !== i)

                                                                setUrl(url => `${url.split('?')[0]}?${filteredParams.map(param => (`${param.key}=${param.value}`)).join('&')}`)

                                                                return filteredParams
                                                            })
                                                        }} className='cursor-pointer'><Trash /></Button>) : null}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button variant='outline' className='mt-3 cursor-pointer' onClick={() => setParamsInfo(paramsInfo => [...paramsInfo, { key: '', value: '' }])}><Plus /> Add</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value='body'>
                            <Card>
                                <CardContent className='max-h-[200px] overflow-auto'>
                                    <Tabs value={bodyType} onValueChange={e => setBodyType(e)}>
                                        <TabsList>
                                            <TabsTrigger value='form-data'><FormInput /> Form-Data</TabsTrigger>
                                            <TabsTrigger value='raw'><TextCursorInput /> Row</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value='form-data'>
                                            <Table>
                                                <TableCaption>The form data to send to the server</TableCaption>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Key</TableHead>
                                                        <TableHead>Value</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {body.map((element, i) => {
                                                        return (
                                                            <TableRow key={i}>
                                                                <TableCell className='flex items-center gap-1'>
                                                                    <Input placeholder='key' value={element.key} onChange={e => setBody(body => {
                                                                        const newBody = [...body]
                                                                        newBody[i] = { ...newBody[i], key: e.target.value }

                                                                        return newBody
                                                                    })} />
                                                                    <Select value={element.type} onValueChange={e => setBody(body => {
                                                                        const newBody = [...body]
                                                                        newBody[i] = { ...newBody[i], type: e, value: '' }

                                                                        return newBody
                                                                    })}>
                                                                        <SelectTrigger className="w-[180px]">
                                                                            <SelectValue placeholder="Type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="text"><Text /> Text</SelectItem>
                                                                            <SelectItem value="file"><File /> File</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className='flex items-center gap-2'>
                                                                        {element.type === 'file'
                                                                            ? <Input type='file' onChange={e => setBody(body => {
                                                                                const newBody = [...body]

                                                                                if (!e.target.files) return newBody

                                                                                newBody[i] = { ...newBody[i], value: e.target.files[0] }

                                                                                return newBody
                                                                            })} />
                                                                            : <Input placeholder='value' onChange={e => setBody(body => {
                                                                                const newBody = [...body]
                                                                                newBody[i] = { ...newBody[i], value: e.target.value }

                                                                                return newBody
                                                                            })} />
                                                                        }
                                                                        {i !== 0 ? (<Button size='icon' variant='destructive' onClick={() => {
                                                                            setBody(prev => {
                                                                                const filteredBody = prev.filter((_, idx) => idx !== i)

                                                                                return filteredBody
                                                                            })
                                                                        }} className='cursor-pointer'><Trash /></Button>) : null}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                            <Button variant='outline' className='mt-3 cursor-pointer' onClick={() => setBody(body => [...body, { key: '', value: '', type: 'text' }])}><Plus /> Add</Button>
                                        </TabsContent>
                                        <TabsContent value='raw'>
                                            <div className='w-full flex justify-end'>
                                                <Select defaultValue='get' value={language} onValueChange={e => setLanguage(e)}>
                                                    <SelectTrigger className="w-[150px]">
                                                        <SelectValue placeholder="Method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='json'><FileJsonIcon /> JSON</SelectItem>
                                                        <SelectItem value='javascript'><Code /> JavaScript</SelectItem>
                                                        <SelectItem value='html'><CodeXml /> HTML</SelectItem>
                                                        <SelectItem value='xml'><CodeSquare /> XML</SelectItem>
                                                        <SelectItem value='text'><Text /> Text</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <CodeBlock
                                                darkMode={true}
                                                language={language}
                                                className='text-xl mt-1.5'
                                                value={raw}
                                                readonly={false}
                                                onChange={e => setRaw(e.target.value)}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value='auth'>
                            <Card>
                                <CardContent>
                                    <Table>
                                        <TableCaption>The API key to use in the request</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className='flex items-center gap-1'>
                                                    <Input placeholder='key' value={key.key} onChange={e => setKey(key => ({ key: e.target.value, value: key.value }))} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex items-center gap-2'>
                                                        <Input placeholder='value' type={showPassword ? 'text' : 'password'} value={key.value} onChange={e => setKey(key => ({ key: key.key, value: e.target.value }))} />
                                                        <Button size='icon' variant='outline' className='cursor-pointer' onClick={() => setShowPassword(showPassword => !showPassword)}>
                                                            {
                                                                showPassword
                                                                    ? <Eye />
                                                                    : <EyeOff />
                                                            }
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value='headers'>
                            <Card>
                                <CardContent>
                                    <Table>
                                        <TableCaption>The headers to be sent to the server</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {
                                                headers.map((header, i) => {
                                                    return (
                                                        <TableRow key={i}>
                                                            <TableCell><Input placeholder='name' onChange={e => setHeaders(headers => {
                                                                const newHeaders = [...headers]
                                                                newHeaders[i] = { ...newHeaders[i], name: e.target.value }

                                                                return newHeaders
                                                            })} /></TableCell>
                                                            <TableCell>
                                                                <div className='flex items-center gap-2'>
                                                                    <Input placeholder='value' onChange={e => setHeaders(headers => {
                                                                        const newHeaders = [...headers]
                                                                        newHeaders[i] = { ...newHeaders[i], value: e.target.value }

                                                                        return newHeaders
                                                                    })} />
                                                                    {i !== 0 ? (<Button size='icon' variant='destructive' onClick={() => {
                                                                        setHeaders(prev => {
                                                                            const filteredHeaders = prev.filter((_, idx) => idx !== i)

                                                                            return filteredHeaders
                                                                        })
                                                                    }} className='cursor-pointer'><Trash /></Button>) : null}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </TableBody>
                                    </Table>
                                    <Button variant='outline' className='mt-3 cursor-pointer' onClick={() => setHeaders(headers => [...headers, { name: '', value: '' }])}><Plus /> Add</Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
                <footer className='md:w-[810px] w-[490px]'>
                    <Card>
                        <CardHeader>Response</CardHeader>
                        <CardContent>
                            {
                                isLoading
                                    ? <Loader />
                                    : <CodeBlock
                                        darkMode={true}
                                        language='json'
                                        className='text-xl'
                                        value={response}
                                        readonly
                                    />
                            }
                        </CardContent>
                    </Card>
                </footer>
            </main>
        </ThemeProvider >
    )
}