export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  readUrl?: string;
  isbn?: string;
}

export interface LibraryCategory {
  id: string;
  title: string;
  books: Book[];
}

export const libraryCategories: LibraryCategory[] = [
  {
    id: 'psychology',
    title: 'Психология трейдинга',
    books: [
      { id: '1', title: 'Trading in the Zone', author: 'Mark Douglas', category: 'psychology', isbn: '9780735201441', coverImage: '/book-covers/психология трейдинга/71tXOGKZkKL._AC_UF894,1000_QL80_.jpg' },
      { id: '2', title: 'The Disciplined Trader', author: 'Mark Douglas', category: 'psychology', isbn: '9780132157575', coverImage: '/book-covers/психология трейдинга/71Ip3kl9eML._AC_UF1000,1000_QL80_.jpg' },
      { id: '3', title: 'The Daily Trading Coach', author: 'Brett Steenbarger', category: 'psychology', isbn: '9780470457337', coverImage: '/book-covers/психология трейдинга/71lraEjudVL._AC_UF1000,1000_QL80_.jpg' },
      { id: '4', title: 'Enhancing Trader Performance', author: 'Brett Steenbarger', category: 'psychology', isbn: '9780471757789', coverImage: '/book-covers/психология трейдинга/61KB1KqFz3L._AC_UF1000,1000_QL80_.jpg' },
      { id: '5', title: 'The Psychology of Trading', author: 'Ari Kiev', category: 'psychology', isbn: '9780471216632', coverImage: '/book-covers/психология трейдинга/71NR1cx3IkL.jpg' },
      { id: '6', title: 'Come Into My Trading Room', author: 'Alexander Elder', category: 'psychology', isbn: '9780471225344', coverImage: '/book-covers/психология трейдинга/71A9R6TgINL._AC_UF1000,1000_QL80_.jpg' },
      { id: '7', title: 'Entries & Exits', author: 'Alexander Elder', category: 'psychology', isbn: '9780470049529', coverImage: '/book-covers/психология трейдинга/518gpslTosL._UF1000,1000_QL80_.jpg' },
      { id: '8', title: 'Trading Psychology 2.0', author: 'Brett Steenbarger', category: 'psychology', isbn: '9781118668038', coverImage: '/book-covers/психология трейдинга/71nYGSJOMAL._AC_UF894,1000_QL80_.jpg' },
      { id: '9', title: 'Mind Over Markets', author: 'James Dalton', category: 'psychology', isbn: '9780470282539', coverImage: '/book-covers/психология трейдинга/9785961426939_p0_v1_s600x595.jpg' },
      { id: '10', title: 'The Art of Execution', author: 'Lee Freeman-Shor', category: 'psychology', isbn: '9781781253770', coverImage: '/book-covers/психология трейдинга/71ShFCaq5pL._AC_UF1000,1000_QL80_.jpg' },
      { id: '11', title: 'Best Loser Wins', author: 'Tom Hougaard', category: 'psychology', isbn: '9780857199090', coverImage: '/book-covers/психология трейдинга/51GKYee2-mL._UF1000,1000_QL80_.jpg' },
      { id: '12', title: 'The Mental Edge in Trading', author: 'Jason Williams', category: 'psychology', coverImage: '/book-covers/психология трейдинга/91h1hHF7awL._AC_UF894,1000_QL80_.jpg' },
    ]
  },
  {
    id: 'general',
    title: 'Трейдинг — общее / Классика',
    books: [
      { id: '13', title: 'Market Wizards', author: 'Jack Schwager', category: 'general', isbn: '9780887306109', coverImage: '/book-covers/трейдингобщее/715RJl2ABlL._AC_UF1000,1000_QL80_.jpg' },
      { id: '14', title: 'The New Market Wizards', author: 'Jack Schwager', category: 'general', isbn: '9780887306673', coverImage: '/book-covers/трейдингобщее/61gKSBZSzfL._AC_UF894,1000_QL80_.jpg' },
      { id: '15', title: 'Stock Market Wizards', author: 'Jack Schwager', category: 'general', isbn: '9780066620590', coverImage: '/book-covers/трейдингобщее/61zq8NtpAHL._AC_UF894,1000_QL80_.jpg' },
      { id: '16', title: 'Unknown Market Wizards', author: 'Jack Schwager', category: 'general', isbn: '9781118273050', coverImage: '/book-covers/трейдингобщее/718gkZCnleL.jpg' },
      { id: '17', title: 'Reminiscences of a Stock Operator', author: 'Edwin Lefèvre', category: 'general', isbn: '9780471770888', coverImage: '/book-covers/трейдингобщее/91Wlo+P0zmL._AC_UF1000,1000_QL80_.jpg' },
      { id: '18', title: 'Trade Your Way to Financial Freedom', author: 'Van Tharp', category: 'general', isbn: '9780071478718', coverImage: '/book-covers/трейдингобщее/61MhgHgNAsL._AC_UF894,1000_QL80_.jpg' },
      { id: '19', title: 'Super Trader', author: 'Van Tharp', category: 'general', isbn: '9780071629135', coverImage: '/book-covers/трейдингобщее/71jjxA3ptVL._AC_UF894,1000_QL80_.jpg' },
      { id: '20', title: 'One Good Trade', author: 'Mike Bellafiore', category: 'general', isbn: '9780470601763', coverImage: '/book-covers/трейдингобщее/51oK2HU7rQL._AC_UF1000,1000_QL80_.jpg' },
    ]
  },
  {
    id: 'forex',
    title: 'Форекс (Forex)',
    books: [
      { id: '21', title: 'Technical Analysis of the Financial Markets', author: 'John Murphy', category: 'forex', isbn: '9780735200666', coverImage: '/book-covers/форекс/71Lql3yLaAL._AC_UF894,1000_QL80_.jpg' },
      { id: '22', title: 'Day Trading and Swing Trading the Currency Market', author: 'Kathy Lien', category: 'forex', isbn: '9780470049529', coverImage: '/book-covers/форекс/71bJ4zJEldL._AC_UF1000,1000_QL80_.jpg' },
      { id: '23', title: 'Currency Trading for Dummies', author: 'Brian Dolan', category: 'forex', isbn: '9780470049529', coverImage: '/book-covers/форекс/41jAytV-+AS._UF1000,1000_QL80_.jpg' },
      { id: '24', title: 'Forex Price Action Scalping', author: 'Bob Volman', category: 'forex', isbn: '9789081824707', coverImage: '/book-covers/форекс/61g0EZffKKL._AC_UF350,350_QL50_.jpg' },
      { id: '25', title: 'Beat the Forex Dealer', author: 'Agustin Silvani', category: 'forex', coverImage: '/book-covers/форекс/914cnJa7ltL._AC_UF894,1000_QL80_.jpg' },
      { id: '26', title: 'How to Make a Living Trading Foreign Exchange', author: 'Courtney Smith', category: 'forex', coverImage: '/book-covers/форекс/61S7lmE+p0L._AC_UF1000,1000_QL80_.jpg' },
      { id: '27', title: 'Forex for Beginners', author: 'Anna Coulling', category: 'forex', isbn: '9781847941231', coverImage: '/book-covers/форекс/81Owbl8-WhL.jpg' },
    ]
  },
  {
    id: 'binary',
    title: 'Бинарные опционы',
    books: [
      { id: '28', title: 'Binary Options Guide', author: 'Various Authors', category: 'binary', coverImage: '/book-covers/опционы/81ty4xKaa-L._UF1000,1000_QL80_.jpg' },
      { id: '29', title: 'Binary Options Unmasked', author: 'Nadex', category: 'binary', coverImage: '/book-covers/опционы/51TV3bnTWqL._UF1000,1000_QL80_.jpg' },
      { id: '30', title: 'Binary Options Trading', author: 'Abe Cofnas', category: 'binary', isbn: '9781118558765', coverImage: '/book-covers/опционы/514GAFOkYwL._AC_UL600_SR600,600_.jpg' },
      { id: '31', title: 'Binary Options Strategies', author: 'Various Authors', category: 'binary', coverImage: '/book-covers/опционы/61u1cciSECL._AC_UF1000,1000_QL80_.jpg' },
      { id: '32', title: 'How to Master the Psychology of Forex & Binary Options Trading', author: 'William Allen', category: 'binary', coverImage: '/book-covers/опционы/61JDm2waNaL._AC_UF894,1000_QL80_.jpg' },
    ]
  },
  {
    id: 'risk',
    title: 'Риск-менеджмент и системы',
    books: [
      { id: '33', title: 'The Mathematics of Money Management', author: 'Ralph Vince', category: 'risk', isbn: '9780471547380', coverImage: '/book-covers/риск мен/31Guxva6fbL._AC_UF1000,1000_QL80_.jpg' },
      { id: '34', title: 'Portfolio Management Formulas', author: 'Ralph Vince', category: 'risk', isbn: '9780471547380', coverImage: '/book-covers/риск мен/71VrbQT9uKL._AC_UF894,1000_QL80_.jpg' },
      { id: '35', title: 'Risk Management and Financial Institutions', author: 'John Hull', category: 'risk', isbn: '9781118955949', coverImage: '/book-covers/риск мен/61YNcshVLIL._AC_UF894,1000_QL80_.jpg' },
      { id: '36', title: 'Position Sizing', author: 'Van Tharp', category: 'risk', isbn: '9780935219099', coverImage: '/book-covers/риск мен/64627_2.webp' },
    ]
  },
  {
    id: 'price-action',
    title: 'Прайс экшн / Теханализ',
    books: [
      { id: '37', title: 'Japanese Candlestick Charting Techniques', author: 'Steve Nison', category: 'price-action', isbn: '9780735201811', coverImage: '/book-covers/прайс екшн/91Dmv4b35dL._UF1000,1000_QL80_.jpg' },
      { id: '38', title: 'Trading Price Action', author: 'Al Brooks', category: 'price-action', coverImage: '/book-covers/прайс екшн/618ic+WPLHL._AC_UF1000,1000_QL80_.jpg' },
      { id: '39', title: 'Reading Price Charts Bar by Bar', author: 'Al Brooks', category: 'price-action', coverImage: '/book-covers/прайс екшн/71Ve6S1Wl7L._AC_UF1000,1000_QL80_.jpg' },
      { id: '40', title: 'Encyclopedia of Chart Patterns', author: 'Thomas Bulkowski', category: 'price-action', isbn: '9780471668261', coverImage: '/book-covers/прайс екшн/81qZNGZXNzL._AC_UF894,1000_QL80_.jpg' },
    ]
  },
  {
    id: 'general-psychology',
    title: 'Общая психология (для трейдера)',
    books: [
      { id: '41', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'general-psychology', isbn: '9780374533557', coverImage: '/book-covers/психолог/71wm29Etl4L._AC_UF894,1000_QL80_.jpg' },
      { id: '42', title: 'Misbehaving', author: 'Richard Thaler', category: 'general-psychology', isbn: '9780393080940', coverImage: '/book-covers/психолог/81kg51XRc1L._AC_UF1000,1000_QL80_.jpg' },
      { id: '43', title: 'Games People Play', author: 'Eric Berne', category: 'general-psychology', isbn: '9780345410030', coverImage: '/book-covers/психолог/717p8VLz79L._AC_UF894,1000_QL80_.jpg' },
      { id: '44', title: 'Influence', author: 'Robert Cialdini', category: 'general-psychology', isbn: '9780061241895', coverImage: '/book-covers/психолог/819H98VG2kL._AC_UF894,1000_QL80_.jpg' },
      { id: '45', title: 'Atomic Habits', author: 'James Clear', category: 'general-psychology', isbn: '9780735211292', coverImage: '/book-covers/психолог/61i0xvfc6fL._AC_UF1000,1000_QL80_.jpg' },
      { id: '46', title: 'The Power of Habit', author: 'Charles Duhigg', category: 'general-psychology', isbn: '9780812981605', coverImage: '/book-covers/психолог/61fdrEuPJwL._AC_UF1000,1000_QL80_.jpg' },
    ]
  },
  {
    id: 'philosophy',
    title: 'Философия и мышление (полезно для трейдера)',
    books: [
      { id: '47', title: 'Meditations', author: 'Marcus Aurelius', category: 'philosophy', isbn: '9780486298238', coverImage: '/book-covers/философ/71RoZkCMk1L.jpg' },
      { id: '48', title: 'Letters from a Stoic', author: 'Seneca', category: 'philosophy', isbn: '9780140442106', coverImage: '/book-covers/философ/71bPC5sjX5L._AC_UF894,1000_QL80_.jpg' },
      { id: '49', title: 'The Art of War', author: 'Sun Tzu', category: 'philosophy', isbn: '9780486425573', coverImage: '/book-covers/философ/811ez0yerlL.jpg' },
      { id: '50', title: 'Antifragile', author: 'Nassim Taleb', category: 'philosophy', isbn: '9781400067824', coverImage: '/book-covers/философ/61ahwmdD6-L._AC_UF894,1000_QL80_.jpg' },
      { id: '51', title: 'Fooled by Randomness', author: 'Nassim Taleb', category: 'philosophy', isbn: '9780812975215', coverImage: '/book-covers/философ/71AP6wGgNjL.jpg' },
    ]
  },
];
