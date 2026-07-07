import { Scheme } from '../../models/Scheme';
import { User } from '../../models/User';
import { redis } from '../../lib/redis';

export class SchemeService {
  static async invalidateCache() {
    try {
      const keys = await redis.keys('schemes:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      // Graceful degradation when Redis is unavailable
    }
  }

  static async getSchemes(filters: any) {
    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '10');
    const skip = (page - 1) * limit;

    const query: any = {  };
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.state) {
      query.state = filters.state;
    }

    // Only active schemes by default
    query.isActive = true;

    // Generate deterministic cache key based on query filters
    const sortedKeys = Object.keys(filters).sort();
    const cacheKey = 'schemes:' + sortedKeys.map(k => `${k}=${filters[k]}`).join('&');

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      // Graceful degradation when Redis is unavailable
    }

    const [schemes, total] = await Promise.all([
      Scheme.find(query).sort({ title: 1 }).skip(skip).limit(limit).lean(),
      Scheme.countDocuments(query),
    ]);

    const result = {
      schemes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };

    try {
      await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 minutes TTL
    } catch (err) {
      // Graceful degradation when Redis is unavailable
    }

    return result;
  }

  static async getSchemeBySlug(slug: string) {
    const scheme = await Scheme.findOne({ slug }).lean();
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };
    return scheme;
  }

  static async matchEligibility(userId: string, data: { age: number; income: number; gender: string; state: string; occupation: string }) {
    await User.findByIdAndUpdate(userId, {
      age: data.age,
      income: data.income,
      gender: data.gender,
      state: data.state,
      occupation: data.occupation,
    });

    const schemes = await Scheme.find({ isActive: true }).lean();

    const scoredSchemes = schemes.map((scheme: any) => {
      const details: { criterion: string; passed: boolean; reason?: string }[] = [];
      let totalApplicable = 0;
      let totalPassed = 0;

      // 1. Min Age Check
      if (scheme.minAge != null) {
        totalApplicable++;
        const passed = data.age >= scheme.minAge;
        if (passed) totalPassed++;
        details.push({
          criterion: 'minAge',
          passed,
          reason: passed ? undefined : `You must be at least ${scheme.minAge} years old (you are ${data.age})`,
        });
      }

      // 2. Max Age Check
      if (scheme.maxAge != null) {
        totalApplicable++;
        const passed = data.age <= scheme.maxAge;
        if (passed) totalPassed++;
        details.push({
          criterion: 'maxAge',
          passed,
          reason: passed ? undefined : `Age limit is ${scheme.maxAge} years (you are ${data.age})`,
        });
      }

      // 3. Max Income Check
      if (scheme.maxIncome != null) {
        totalApplicable++;
        const passed = data.income <= scheme.maxIncome;
        if (passed) totalPassed++;
        details.push({
          criterion: 'maxIncome',
          passed,
          reason: passed ? undefined : `Your annual income exceeds the limit by ₹${(data.income - scheme.maxIncome).toLocaleString('en-IN')}`,
        });
      }

      // 4. Gender Check
      if (scheme.gender && scheme.gender !== 'ALL') {
        totalApplicable++;
        const passed = scheme.gender.toUpperCase() === data.gender.toUpperCase();
        if (passed) totalPassed++;
        details.push({
          criterion: 'gender',
          passed,
          reason: passed ? undefined : `Scheme is only available for ${scheme.gender} applicants (you selected ${data.gender})`,
        });
      }

      // 5. State Check
      if (scheme.state && scheme.state !== 'National') {
        totalApplicable++;
        const passed = scheme.state.toUpperCase() === data.state.toUpperCase();
        if (passed) totalPassed++;
        details.push({
          criterion: 'state',
          passed,
          reason: passed ? undefined : `Scheme is only available in ${scheme.state} (you are in ${data.state})`,
        });
      }

      // 6. Occupation Check
      if (scheme.occupation && scheme.occupation !== '') {
        totalApplicable++;
        const passed = scheme.occupation.toUpperCase() === data.occupation.toUpperCase();
        if (passed) totalPassed++;
        details.push({
          criterion: 'occupation',
          passed,
          reason: passed ? undefined : `Scheme is restricted to ${scheme.occupation} (you selected ${data.occupation})`,
        });
      }

      const matchScore = totalApplicable === 0 ? 1 : totalPassed / totalApplicable;

      return {
        ...scheme,
        matchScore,
        totalApplicable,
        totalPassed,
        details,
      };
    });

    return scoredSchemes.sort((a, b) => b.matchScore - a.matchScore);
  }

  static async createScheme(data: any) {
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    };

    let slug = slugify(data.title);
    const existing = await Scheme.findOne({ slug }).lean();
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const created = await Scheme.create({ ...data, slug });
    await this.invalidateCache();
    return created.toObject();
  }

  static async updateScheme(id: string, data: any) {
    const scheme = await Scheme.findById(id);
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    let slug = scheme.slug;
    if (data.title && data.title !== scheme.title) {
      const slugify = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      };
      slug = slugify(data.title);
      const existing = await Scheme.findOne({ slug }).lean();
      if (existing && existing._id.toString() !== id) {
        slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    Object.assign(scheme, { ...data, slug });
    await scheme.save();
    await this.invalidateCache();
    return scheme.toObject();
  }

  static async deleteScheme(id: string) {
    const scheme = await Scheme.findById(id);
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    await Scheme.deleteOne({ _id: id });
    await this.invalidateCache();
    return { success: true };
  }
}

