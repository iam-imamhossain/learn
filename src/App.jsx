"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, History, Volume2, HelpCircle } from "lucide-react"
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
  useToast,
  useColorMode
} from "@chakra-ui/react"

import { wordsPromise } from "./data/words.js"
import { WordDisplay } from './components/WordDisplay'
import { InputSection } from './components/InputSection'
import { ButtonControls } from './components/ButtonControls'
import { StatsDisplay } from './components/StatsDisplay'
import { HistoryModal } from './components/HistoryModal'
import { useSpeech } from './hooks/useSpeech'
import { theme } from './utils/theme'
import { getRandomGradient } from './styles/gradients'
import { ProgressBar } from './components/ProgressBar'
import { StreakCounter } from './components/StreakCounter'
import { ShortcutsGuide } from './components/ShortcutsGuide'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function HomeComponent() {
  const { colorMode } = useColorMode()
  const [words, setWords] = useState([])
  const [currentWordIndex, setCurrentWordIndex] = useState(() => {
    const saved = localStorage.getItem('currentWordIndex')
    return saved ? parseInt(saved, 10) : 0
  })
  const [userInput, setUserInput] = useState("")
  const [isCorrect, setIsCorrect] = useState(null)
  const [randomGradient, setRandomGradient] = useState(getRandomGradient(colorMode))
  const [correctCount, setCorrectCount] = useState(() => {
    const saved = localStorage.getItem('correctCount')
    return saved ? parseInt(saved, 10) : 0
  })
  const [incorrectCount, setIncorrectCount] = useState(() => {
    const saved = localStorage.getItem('incorrectCount')
    return saved ? parseInt(saved, 10) : 0
  })
  const [hasCountedIncorrect, setHasCountedIncorrect] = useState(() => {
    const saved = localStorage.getItem('hasCountedIncorrect')
    return saved === 'true'
  })
  const [showCorrectWord, setShowCorrectWord] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [wordHistory, setWordHistory] = useState(() => {
    const savedHistory = localStorage.getItem('wordHistory')
    return savedHistory ? JSON.parse(savedHistory) : []
  })

  const { speakWord } = useSpeech()

  const [isLoading, setIsLoading] = useState(true)

  const toast = useToast()

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('streak')
    return saved ? parseInt(saved, 10) : 0
  })

  const [bestStreak, setBestStreak] = useState(() => {
    const saved = localStorage.getItem('bestStreak')
    return saved ? parseInt(saved, 10) : 0
  })

  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    localStorage.setItem('currentWordIndex', currentWordIndex.toString())
  }, [currentWordIndex])

  useEffect(() => {
    wordsPromise.then(loadedWords => {
      setWords(loadedWords)
      setIsLoading(false)
      const saved = localStorage.getItem('currentWordIndex')
      if (saved && parseInt(saved, 10) >= loadedWords.length) {
        setCurrentWordIndex(0)
      }
    }).catch(error => {
      console.error('Error loading words:', error)
    })
  }, [])

  useEffect(() => {
    localStorage.setItem('correctCount', correctCount.toString())
  }, [correctCount])

  useEffect(() => {
    localStorage.setItem('incorrectCount', incorrectCount.toString())
  }, [incorrectCount])

  useEffect(() => {
    localStorage.setItem('hasCountedIncorrect', hasCountedIncorrect.toString())
  }, [hasCountedIncorrect])

  useEffect(() => {
    localStorage.setItem('streak', streak.toString())
  }, [streak])

  useEffect(() => {
    if (streak > bestStreak) {
      setBestStreak(streak)
      localStorage.setItem('bestStreak', streak.toString())
    }
  }, [streak, bestStreak])

  const currentWord = words.length > 0 ? words[currentWordIndex] : { correct: '', incorrect: '' }

  const checkPronunciation = () => {
    const isAnswerCorrect = userInput.toLowerCase().trim() === currentWord.correct.toLowerCase()
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      setStreak(prev => prev + 1)
      const newCount = correctCount + 1
      setCorrectCount(newCount)
      localStorage.setItem('correctCount', newCount.toString())

      // Automatically move to next word after a short delay
      setTimeout(() => {
        nextWord()
      }, 1000) // 1 second delay to show the success state
    } else {
      setStreak(0)
      if (!hasCountedIncorrect) {
        const newCount = incorrectCount + 1
        setIncorrectCount(newCount)
        setHasCountedIncorrect(true)
        localStorage.setItem('incorrectCount', newCount.toString())
        localStorage.setItem('hasCountedIncorrect', 'true')
      }
    }

    const newHistory = [{
      word: currentWord.correct,
      isCorrect: isAnswerCorrect,
      attempt: userInput,
      timestamp: Date.now()
    }, ...wordHistory.filter(item => item.word !== currentWord.correct)]

    setWordHistory(newHistory)
    localStorage.setItem('wordHistory', JSON.stringify(newHistory))
  }

  const handleInputChange = (e) => {
    setUserInput(e.target.value)
    setIsCorrect(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      checkPronunciation()
    }
  }

  const nextWord = () => {
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    setUserInput("")
    setIsCorrect(null)
    setHasCountedIncorrect(false)
    localStorage.setItem('hasCountedIncorrect', 'false')
    setRandomGradient(getRandomGradient(colorMode))
  }

  const prevWord = () => {
    setCurrentWordIndex((prevIndex) => {
      const newIndex = prevIndex - 1
      return newIndex < 0 ? words.length - 1 : newIndex
    })
    setUserInput("")
    setIsCorrect(null)
    setHasCountedIncorrect(false)
    localStorage.setItem('hasCountedIncorrect', 'false')
    setRandomGradient(getRandomGradient(colorMode))
  }

  useEffect(() => {
    setUserInput("")
    setIsCorrect(null)
  }, [currentWordIndex])

  const handleReset = () => {
    setCurrentWordIndex(0)
    setUserInput("")
    setIsCorrect(null)
    setCorrectCount(0)
    setIncorrectCount(0)
    setHasCountedIncorrect(false)
    setWordHistory([])
    setStreak(0)
    setBestStreak(0)

    localStorage.removeItem('currentWordIndex')
    localStorage.removeItem('correctCount')
    localStorage.removeItem('incorrectCount')
    localStorage.removeItem('hasCountedIncorrect')
    localStorage.removeItem('wordHistory')
    localStorage.removeItem('streak')
    localStorage.removeItem('bestStreak')

    setRandomGradient(getRandomGradient(colorMode))
  }

  useEffect(() => {
    setRandomGradient(getRandomGradient(colorMode))
  }, [colorMode])

  const bgGradient = `linear(to-br, ${randomGradient.join(', ')})`

  //const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  useKeyboardShortcuts({
    showHistory,
    setShowHistory,
    nextWord,
    prevWord,
    setShowCorrectWord,
    speakWord,
    currentWord
  })

  return (
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" p={[2, 4]}>
        {isLoading ? (
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" color="blue.400" />
            <Text color="gray.400">Loading words...</Text>
          </Flex>
        ) : (
          <Box
            width="full"
            maxWidth={{ base: "100%", md: "md" }}
            mx="auto"
            p={{ base: 3, md: 6 }}
            bgGradient={bgGradient}
            borderRadius="lg"
            boxShadow="dark-lg"
            borderWidth={1}
            borderColor="gray.700"
            position="relative"
          >
            <VStack spacing={[3, 4]} p={[3, 6]}>
              <ProgressBar
                current={currentWordIndex + 1}
                total={words.length}
              />

              <StreakCounter streak={streak} bestStreak={bestStreak} />

              <Heading as="h1" size="xl" textAlign="center" color="gray.100">
                {/* Spelling Checker */}
              </Heading>

              <Text textAlign="center" color="gray.400" fontSize={["sm", "md"]}>
                Type the correct spelling for the word below
              </Text>

              <WordDisplay
                word={currentWord}
                onSpeak={speakWord}
              />

              <InputSection
                userInput={userInput}
                onInputChange={handleInputChange}
                onKeyDown={handleKeyDown}
                isCorrect={isCorrect}
              />

              <ButtonControls
                onCheck={checkPronunciation}
                onPrev={prevWord}
                onNext={nextWord}
                onReset={handleReset}
              />

              <StatsDisplay
                correctCount={correctCount}
                incorrectCount={incorrectCount}
                currentIndex={currentWordIndex}
                totalWords={words.length}
              />
            </VStack>

            <Flex
              position={{ base: "relative", md: "absolute" }}
              bottom={{ base: "auto", md: "-80px" }}
              left="50%"
              transform="translateX(-50%)"
              gap={2}
              mt={{ base: 4, md: 8 }}
              mb={{ base: 2, md: 0 }}
              flexWrap="wrap"
              justifyContent="center"
              width={{ base: "full", md: "auto" }}
              zIndex={2}
            >
              <Button
                size="sm"
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
                color="gray.100"
                onClick={() => setShowCorrectWord(!showCorrectWord)}
                leftIcon={showCorrectWord ? <EyeOff size={16} /> : <Eye size={16} />}
                title="Mac: ⌘ + O | Win: Ctrl + O"
              >
                {showCorrectWord ? 'Hide Answer' : 'Show Answer'}
              </Button>

              <Button
                size="sm"
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
                color="gray.100"
                onClick={() => setShowHistory(!showHistory)}
                leftIcon={<History size={16} />}
                title="Mac: ⌘ + H | Win: Ctrl + H"
              >
                History
              </Button>

              <Button
                size="sm"
                bg="gray.700"
                _hover={{ bg: "gray.600" }}
                color="gray.100"
                onClick={() => setShowShortcuts(true)}
                leftIcon={<HelpCircle size={16} />}
                title="Show keyboard shortcuts"
              >
                Shortcuts
              </Button>
            </Flex>

            {showCorrectWord && (
              <Flex
                position={{ base: "relative", md: "absolute" }}
                bottom={{ base: "auto", md: "-120px" }}
                left="50%"
                transform="translateX(-50%)"
                color="gray.300"
                fontSize="lg"
                fontWeight="bold"
                alignItems="center"
                gap={2}
                mt={{ base: 4, md: 0 }}
                mb={{ base: 2, md: 0 }}
                width={{ base: "full", md: "auto" }}
                justifyContent="center"
              >
                {currentWord.correct}
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "gray.200" }}
                  onClick={() => speakWord(currentWord.correct)}
                  title="Listen to pronunciation"
                  aria-label="Listen to pronunciation"
                >
                  <Volume2 size={16} />
                </Button>
              </Flex>
            )}
          </Box>
        )}

        <ShortcutsGuide
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />

        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={wordHistory}
        />
      </Box>
    </ChakraProvider>
  )
}