import React, { useState } from 'react';
import { useXApi, useXAPICredentials } from '../hooks/useX';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tweet } from "react-tweet"
import { useXAiApi } from "@/hooks/useXAi";
import { useAppWebpageContent } from "@/hooks/useApp";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Keyword {
  text: string;
  isIncluded: boolean;
}

const TwitterSearch: React.FC = () => {
  const xApi = useXApi();
  const xAiApi = useXAiApi();
  const xAPICredentials = useXAPICredentials();
  const webpageContent = useAppWebpageContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStatus, setParsingStatus] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSearch = async () => {
    if (!xApi) {
      console.error('X API is not initialized');
      return;
    }

    try {
      const includedKeywords = keywords
        .filter(kw => kw.isIncluded)
        .map(kw => kw.text)
        .join(' ');

      let finalQuery = keywords.length > 0 ? includedKeywords : searchQuery;
      
      // Replace "and" with "&" to avoid Twitter API issues
      finalQuery = finalQuery.replace(/\band\b/gi, "&");

      setHasSearched(true);
      setSearchResults(null);
      setSummary("");

      const response = await xApi.searchTweets(finalQuery);
      setSearchResults(response);

      if (response.data && response.data.length > 0) {
        await generateSummary(response.data, finalQuery);
      } else {
        setSummary("");
      }
    } catch (error) {
      console.error('Error searching tweets:', error);
      setSearchResults(null);
      setSummary("");
      
      let errorMessage = "An error occurred while searching tweets.";
      if (error.response && error.response.data && error.response.data.errors) {
        const twitterError = error.response.data.errors[0];
        errorMessage = `Twitter API error: ${twitterError.message}`;
      }
      
      setError(errorMessage);
    }
  };

  const generateSummary = async (tweets: any[], query: string) => {
    if (!xAiApi) {
      console.error('XAiApi is not initialized');
      return;
    }
    const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n');
    const prompt = `Analyze these tweets about "${query}" and generate a list of 3-5 key points that users are talking about. Format your response as: "Users are talking about: (point1, point2, point3, ...)". Be concise and focus on the most prominent topics.

${tweetTexts}`;

    try {
      const response = await xAiApi.sendMessage([
        { role: "user", content: prompt }
      ], { temperature: 0.3 });

      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        setSummary(response.choices[0].message.content.trim());
      }
    } catch (error) {
      console.error('Error generating key points:', error);
      setSummary("");
    }
  };

  const getKeywordsFromWebpage = async () => {
    if (!xAiApi || !webpageContent) {
      console.error("xAiApi or webpageContent is missing");
      return;
    }

    setIsParsing(true);
    setParsingStatus("Analyzing webpage content...");

    try {
      const systemPrompt = `
        Analyze the following webpage content and extract 5-10 key phrases or keywords that best represent the main topics and themes of the page. Return these as a JSON array of objects, each with a "text" property. Do not wrap the JSON in a code block.
      `;

      const response = await xAiApi.sendMessage([
        { role: "system", content: systemPrompt },
        { role: "user", content: webpageContent.substring(0, 8000) },
      ]);

      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        let content = response.choices[0].message.content;

        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          content = jsonMatch[0];
          const parsedKeywords: Keyword[] = JSON.parse(content).map((kw: { text: string }) => ({
            ...kw,
            isIncluded: false
          }));
          setKeywords(parsedKeywords);
        }
      }
    } catch (error) {
      console.error("Error extracting keywords:", error);
    } finally {
      setIsParsing(false);
      setParsingStatus("");
    }
  };

  const toggleKeyword = (index: number) => {
    setKeywords(prev =>
      prev.map((kw, i) =>
        i === index ? { ...kw, isIncluded: !kw.isIncluded } : kw
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-6">
          <h2 className="text-2xl font-bold mb-4">X Search</h2>
          {!hasSearched && (
            <>
              {keywords.length === 0 && (
                <div className="mt-4">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search query"
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={!xAPICredentials || searchQuery.trim() === ''}
                    >
                      Search Tweets
                    </Button>
                  </div>
                </div>
              )}
              <Button
                onClick={getKeywordsFromWebpage}
                disabled={isParsing}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                variant="default"
              >
                {isParsing ? "Parsing..." : "Extract Keywords from Webpage"}
              </Button>
              {isParsing && (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{parsingStatus}</span>
                </div>
              )}
              {keywords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Keywords:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {keywords.map((kw, index) => (
                      <div key={index} className="flex items-center">
                        <Checkbox
                          id={`keyword-${index}`}
                          checked={kw.isIncluded}
                          onCheckedChange={() => toggleKeyword(index)}
                          className="mr-2"
                        />
                        <label htmlFor={`keyword-${index}`} className="text-sm">
                          {kw.text}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={!xAPICredentials || keywords.filter(kw => kw.isIncluded).length === 0}
                    className="mt-4 w-full"
                  >
                    Search with Selected Keywords
                  </Button>
                </div>
              )}
            </>
          )}
          {hasSearched && (
            <div className="mt-4">
              {searchResults && searchResults.data && searchResults.data.length > 0 ? (
                <>
                  {summary && (
                    <Card className="mb-4 p-4 bg-gray-800 border-gray-700">
                      <h3 className="text-lg font-semibold mb-2">Summary</h3>
                      <p className="text-white">{summary}</p>
                    </Card>
                  )}
                  <div className="space-y-8">
                    {searchResults.data.map((tweet: any) => (
                      tweet.id ? <Tweet id={tweet.id} key={tweet.id} /> : null
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">No relevant tweets found</p>
              )}
              {error && (
                <Card className="mb-4 p-4 bg-red-900 border-red-700">
                  <p className="text-white">{error}</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterSearch;
