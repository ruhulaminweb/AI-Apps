import { FlutterFile } from "../types";

export const flutterCodebase: FlutterFile[] = [
  {
    path: "pubspec.yaml",
    title: "pubspec.yaml (Flutter Dependencies)",
    language: "yaml",
    code: `name: proconnect_mobile
description: "ProConnect LinkedIn Clone - Unified Cross-Platform Mobile Application for Android & iOS."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  google_fonts: ^6.1.0
  provider: ^6.1.2
  http: ^1.2.0
  shared_preferences: ^2.2.2
  cached_network_image: ^3.3.1
  flutter_svg: ^2.0.10+1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,
  },
  {
    path: "lib/main.dart",
    title: "lib/main.dart (Entry Point & Theme)",
    language: "dart",
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/feed_screen.dart';
import 'screens/network_screen.dart';
import 'screens/jobs_screen.dart';
import 'screens/messaging_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const ProConnectApp());
}

class ProConnectApp extends StatelessWidget {
  const ProConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProConnect - Professional Network',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0A66C2), // LinkedIn Primary Blue
          primary: const Color(0xFF0A66C2),
          surface: Colors.white,
          background: const Color(0xFFF4F2EE),
        ),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          scaffoldBackgroundColor: Color(0xFFF4F2EE),
        ),
      ),
      darkTheme: ThemeData.dark(useMaterial3: true).copyWith(
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: const Color(0xFF0A66C2),
          primary: const Color(0xFF378FE9),
          surface: const Color(0xFF1B1F23),
          background: const Color(0xFF000000),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    FeedScreen(),
    NetworkScreen(),
    JobsScreen(),
    MessagingScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF0A66C2),
        unselectedItemColor: Colors.grey.shade600,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'My Network',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            activeIcon: Icon(Icons.work),
            label: 'Jobs',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat_bubble),
            label: 'Messaging',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: "lib/models/post.dart",
    title: "lib/models/post.dart (Data Model)",
    language: "dart",
    code: `class PostModel {
  final String id;
  final String authorName;
  final String authorHeadline;
  final String authorAvatar;
  final String content;
  final String createdAt;
  final String? imageUrl;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  bool isLiked;

  PostModel({
    required this.id,
    required this.authorName,
    required this.authorHeadline,
    required this.authorAvatar,
    required this.content,
    required this.createdAt,
    this.imageUrl,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.sharesCount = 0,
    this.isLiked = false,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['id'] ?? '',
      authorName: json['authorName'] ?? '',
      authorHeadline: json['authorHeadline'] ?? '',
      authorAvatar: json['authorAvatar'] ?? '',
      content: json['content'] ?? '',
      createdAt: json['createdAt'] ?? '',
      imageUrl: json['imageUrl'],
      likesCount: json['likesCount'] ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      sharesCount: json['sharesCount'] ?? 0,
      isLiked: json['isLiked'] ?? false,
    );
  }
}
`,
  },
  {
    path: "lib/screens/feed_screen.dart",
    title: "lib/screens/feed_screen.dart (Home Feed UI)",
    language: "dart",
    code: `import 'package:flutter/material.dart';

class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F2EE),
      appBar: AppBar(
        titleSpacing: 12,
        title: Container(
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFFEEF3F8),
            borderRadius: BorderRadius.circular(4),
          ),
          child: const TextField(
            decoration: InputDecoration(
              hintText: 'Search people, jobs, posts...',
              prefixIcon: Icon(Icons.search, size: 20, color: Colors.black54),
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 8),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline, color: Colors.black87),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        children: [
          // Post Creator Card
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Text(
                      'Start a post, try AI Assistant...',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Sample Post Card 1
          _buildPostCard(
            author: 'Sophia Martinez',
            headline: 'Principal AI Researcher @ InnovateAI',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
            time: '2h ago',
            content: '🚀 Published our latest Flutter & Gemini AI benchmarks for cross-platform Android & iOS development! Multi-device synchronization yields 55% productivity gains.',
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
            likes: '142',
            comments: '24',
          ),

          // Sample Post Card 2
          _buildPostCard(
            author: 'Marcus Vance',
            headline: 'VP of Product @ MobileFirst',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
            time: '5h ago',
            content: '📲 Why Flutter is the top choice for single codebase Android & iOS deployments in 2026: Fast rendering with Impeller, hot reload, and native performance.',
            imageUrl: null,
            likes: '210',
            comments: '38',
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard({
    required String author,
    required String headline,
    required String avatar,
    required String time,
    required String content,
    String? imageUrl,
    required String likes,
    required String comments,
  }) {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(radius: 22, backgroundImage: NetworkImage(avatar)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAlignment.start,
                  children: [
                    Text(author, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    Text(headline, style: TextStyle(color: Colors.grey.shade600, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(time, style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.more_vert, size: 18), onPressed: () {}),
            ],
          ),
          const SizedBox(height: 10),
          Text(content, style: const TextStyle(fontSize: 13, height: 1.4)),
          if (imageUrl != null) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Image.network(imageUrl, fit: BoxFit.cover, width: double.infinity, height: 200),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAlignment.spaceBetween,
            children: [
              Text('👍 ❤️ $likes likes', style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
              Text('$comments comments', style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
            ],
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAlignment.spaceAround,
            children: [
              _buildActionButton(Icons.thumb_up_alt_outlined, 'Like'),
              _buildActionButton(Icons.comment_outlined, 'Comment'),
              _buildActionButton(Icons.repeat, 'Repost'),
              _buildActionButton(Icons.send_outlined, 'Send'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade700),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.grey.shade700, fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
`,
  },
  {
    path: "README.md",
    title: "README.md (APK & iOS Compilation Guide)",
    language: "markdown",
    code: `# ProConnect Flutter Mobile App (Android APK & iOS)

This is the unified Flutter codebase for **ProConnect**, the professional network clone. It compiles down to native **Android APK / App Bundle** and **iOS IPA**.

---

## 🚀 Quick Setup & Local Execution

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.20.0+)
- Android Studio / Xcode
- Java Development Kit (JDK 17+)

### 2. Install Dependencies
\`\`\`bash
flutter pub get
\`\`\`

### 3. Run on Emulator / Connected Device
\`\`\`bash
flutter run
\`\`\`

---

## 📦 Building Android APK (Release)

To generate the standalone **APK** for Android devices:

\`\`\`bash
# Build universal release APK
flutter build apk --release

# Output path:
# build/app/outputs/flutter-apk/app-release.apk
\`\`\`

For Google Play Store submission (AAB format):
\`\`\`bash
flutter build appbundle --release
\`\`\`

---

## 🍏 Building iOS (IPA)

To build for iPhone & iPad (macOS required with Xcode):

\`\`\`bash
# Build iOS Release App
flutter build ipa --release --no-codesign
\`\`\`

---

## 📂 Project Structure
- \`lib/main.dart\` - Entry point, bottom nav, Material3 theme
- \`lib/screens/\` - Home Feed, My Network, Jobs, Messaging, Profile
- \`lib/models/\` - Strong data structures
- \`pubspec.yaml\` - Package configuration
`,
  },
];
