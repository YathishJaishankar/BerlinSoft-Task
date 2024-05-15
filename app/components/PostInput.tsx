import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { User } from '../../types';
import { HiddenDiv } from './PostInput.styles';

interface Post {
  id: number;
  content: string;
  author: string;
  timestamp: number; 
}

const PostInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [mentions, setMentions] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [posts, setPosts] = useState<Post[]>(() => {
    
    if (typeof window !== 'undefined') {
      const storedPosts = localStorage.getItem('posts');
      return storedPosts ? JSON.parse(storedPosts) : [];
    } else {
      return [];
    }
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const hiddenDivRef = useRef<HTMLDivElement>(null);

  const users: User[] = [
    { id: 1, name: 'Vijay' },
    { id: 2, name: 'Surya' },
    { id: 3, name: 'Ajith' },
    { id: 3, name: 'Ram' },
    { id: 3, name: 'Sita' },
    
  ];

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('posts', JSON.stringify(posts));
    }
  }, [posts]);

  const getTimestamp = (timestamp: number): string => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = now.getTime() - postDate.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) {
      return 'Less than a minute ago';
    } else if (minutes === 1) {
      return '1 minute ago';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      if (hours === 1) {
        return '1 hour ago';
      } else {
        return `${hours} hours ago`;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDropdownOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleUserSelect(searchResults[selectedIndex]);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, searchResults, selectedIndex]);

  useEffect(() => {
    if (inputValue[cursorPosition - 1] === '@') {
      const textarea = inputRef.current;
      const hiddenDiv = hiddenDivRef.current;
      if (textarea && hiddenDiv) {
        const textBeforeCursor = inputValue.slice(0, cursorPosition - 1);
        hiddenDiv.innerText = textBeforeCursor.replace(/\n$/, '\n\u00a0');
        const span = document.createElement('span');
        span.innerText = '@';
        hiddenDiv.appendChild(span);

        const rect = span.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + textarea.scrollTop,
          left: rect.left + textarea.scrollLeft,
        });
        setIsDropdownOpen(true);
      }
    } else if (inputValue[cursorPosition - 1] === ' ') {
      setIsDropdownOpen(false);
    }
  }, [inputValue, cursorPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setCursorPosition(e.target.selectionStart);
    if (e.target.selectionStart < cursorPosition) {
      setIsDropdownOpen(false);
    }
  };

  const handleUserSelect = (user: User) => {
    const textBeforeCursor = inputValue.slice(0, cursorPosition - 1);
    const textAfterCursor = inputValue.slice(cursorPosition);
    const newText = `${textBeforeCursor}@${user.name} ${textAfterCursor}`;

    setInputValue(newText);
    setIsDropdownOpen(false);
    setMentions([...mentions, user]);
    inputRef.current?.focus();
    setCursorPosition(textBeforeCursor.length + user.name.length + 2);
  };

  const handlePost = () => {
    if (inputValue.trim()) {
      const newPost = {
        id: posts.length + 1,
        content: inputValue,
        author: 'Current User', 
        timestamp: new Date(), 
      };
      setPosts([...posts, newPost]);
      setInputValue('');
      setCursorPosition(0);
      setIsDropdownOpen(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(inputValue.slice(cursorPosition).toLowerCase())
  );

  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      dropdownRef.current.scrollTop = (dropdownRef.current.children[selectedIndex] as HTMLElement).offsetTop;
    }
  }, [selectedIndex]);


  
      return (
        <div className="relative w-full max-w-md mx-auto mt-10">
          
          <textarea
            ref={inputRef}
            className="w-full p-2 border border-gray-300 rounded-md bg-white relative"
            rows={4}
            placeholder="Create a post..."
            value={inputValue}
            onChange={handleInputChange}
          />
          
          <div
            ref={hiddenDivRef}
            className="hidden"
            style={{
              position: 'absolute',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              visibility: 'hidden',
              pointerEvents: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }}
          />
          
          {isDropdownOpen && (
            <ul
              ref={dropdownRef}
              className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
            >
              
              {filteredUsers.map((user, index) => (
                <li
                  key={user.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${selectedIndex === index ? 'bg-gray-200': ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          )}
          
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
              onClick={handlePost}
            >
              Post
            </button>
          </div>
          
          <div className="mt-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 mb-4 border border-gray-300 rounded-md bg-white">
                <p className="font-bold">{post.author}</p>
                <p className="text-gray-500 text-xs">{getTimestamp(post.timestamp)}</p>
                <hr className="my-2 border-gray-400" />
                <p>
                {post.content.split(' ').map((word, index, array) => {
                    if (word.startsWith('@')) {
                        const username = word.substring(1);
                      return (
                        <span key={index} className="text-pink-500">
                        {username} {index !== array.length - 1 && ' '}
                        </span>
                       );}
                        
                      return <span key={index}>{word} </span>;
                    })}
                  </p>

              </div>
              ))}
          </div>
        </div>
      );
};
    
    export default PostInput;
    